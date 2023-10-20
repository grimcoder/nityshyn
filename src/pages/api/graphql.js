import { ApolloServer, gql } from 'apollo-server-micro';
import AWS from 'aws-sdk';
const YOUR_AWS_REGION = "us-west-1";

AWS.config.update({ region: YOUR_AWS_REGION });

const cognito = new AWS.CognitoIdentityServiceProvider();


const crypto = require('crypto');

function computeSecretHash(clientId, secretKey, username) {
    const message = username + clientId;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(message);
    return hmac.digest('base64');
}

const typeDefs = gql`

type Query {
    # Tenants
    tenant(id: ID!): Tenant
    tenants: [Tenant!]

    # Users
    user(id: ID!): User
    users: [User!]

    # Articles
    article(id: ID!): Article
    articles: [Article!]

    # Media
    media(id: ID!): Media
    medias: [Media!]

    # Comments
    comment(id: ID!): Comment
    comments: [Comment!]

    # Categories
    category(id: ID!): Category
    categories: [Category!]
  }

  type Mutation {
      register(input: RegisterInput!): RegisterResponse!
  }

  input RegisterInput {
      email: String!
      password: String!
      username: String!
  }

  type RegisterResponse {
      success: Boolean!
      message: String
      user: User
  }

  type Mutation {
    login(input: LoginInput!): LoginResponse!

    createTenant(input: CreateTenantInput!): Tenant!
    updateTenant(id: ID!, input: UpdateTenantInput!): Tenant!
    deleteTenant(id: ID!): DeleteResponse!

    # Users
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): DeleteResponse!

    # Articles
    createArticle(input: CreateArticleInput!): Article!
    updateArticle(id: ID!, input: UpdateArticleInput!): Article!
    deleteArticle(id: ID!): DeleteResponse!

    # Media
    createMedia(input: CreateMediaInput!): Media!
    updateMedia(id: ID!, input: UpdateMediaInput!): Media!
    deleteMedia(id: ID!): DeleteResponse!

    # Comments
    createComment(input: CreateCommentInput!): Comment!
    updateComment(id: ID!, input: UpdateCommentInput!): Comment!
    deleteComment(id: ID!): DeleteResponse!

    # Categories
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): DeleteResponse!

    # Article-Category Relationship
    addArticleToCategory(articleId: ID!, categoryId: ID!): Article!
    removeArticleFromCategory(articleId: ID!, categoryId: ID!): Article!
  }

  input LoginInput {
    email: String!
    password: String!
  }


# Tenant Mutations
input CreateTenantInput {
    name: String!
    domain: String!
}

input UpdateTenantInput {
    name: String
    domain: String
}

# User Mutations
input CreateUserInput {
    tenant_id: ID!
    email: String!
    password: String! # Ensure this is hashed before being saved to the database
    role: UserRole!
}

input UpdateUserInput {
    tenant_id: ID
    email: String
    password: String
    role: UserRole
}

# Article Mutations
input CreateArticleInput {
    tenant_id: ID!
    author_id: ID!
    title: String!
    content: String!
    published_at: String
}

input UpdateArticleInput {
    tenant_id: ID
    author_id: ID
    title: String
    content: String
    published_at: String
}

# Media Mutations
input CreateMediaInput {
    tenant_id: ID!
    article_id: ID
    url: String!
    type: MediaType!
}

input UpdateMediaInput {
    tenant_id: ID
    article_id: ID
    url: String
    type: MediaType
}

# Comment Mutations
input CreateCommentInput {
    article_id: ID!
    author_id: ID!
    content: String!
}

input UpdateCommentInput {
    article_id: ID
    author_id: ID
    content: String
}

# Category Mutations
input CreateCategoryInput {
    tenant_id: ID!
    name: String!
    description: String
}

input UpdateCategoryInput {
    tenant_id: ID
    name: String
    description: String
}

# Standard Response for Delete Mutations
type DeleteResponse {
    success: Boolean!
    message: String
}

  type LoginResponse {
    success: Boolean!
    message: String!
    token: String
    user: User
  }

  type Tenant {
    tenant_id: ID!
    name: String!
    domain: String!
    created_at: String!
    updated_at: String!
    users: [User!]
    articles: [Article!]
    media: [Media!]
    categories: [Category!]
}

type User {
    user_id: ID!
    tenant: Tenant!
    email: String!
    password: String! # Be cautious about returning passwords!
    role: UserRole!
    created_at: String!
    updated_at: String!
    articles: [Article!]
    comments: [Comment!]
}

enum UserRole {
    admin
    editor
    viewer
}

type Article {
    article_id: ID!
    tenant: Tenant!
    author: User!
    title: String!
    content: String!
    published_at: String
    created_at: String!
    updated_at: String!
    media: [Media!]
    comments: [Comment!]
    categories: [Category!]
}

type Media {
    media_id: ID!
    tenant: Tenant!
    article: Article
    url: String!
    type: MediaType!
    created_at: String!
    updated_at: String!
}

enum MediaType {
    image
    video
}

type Comment {
    comment_id: ID!
    article: Article!
    author: User!
    content: String!
    created_at: String!
    updated_at: String!
}

type Category {
    category_id: ID!
    tenant: Tenant!
    name: String!
    description: String
    articles: [Article!]
}
`;

const ClientId = process.env.YOUR_COGNITO_APP_CLIENT_ID;
const clientSecret = process.env.COGNITO_APP_CLIENT_SECRET;

const resolvers = {
    Mutation: {
        register: async (_, { input }) => {
            try {

                const SecretHash = computeSecretHash(ClientId, clientSecret, input.username);

                const params = {
                    ClientId,
                    Username: input.username,
                    Password: input.password,
                    UserAttributes: [
                        {
                            Name: 'email',
                            Value: input.email
                        }
                    ],
                    SecretHash
                };

                const response = await cognito.signUp(params).promise();

                return {
                    success: true,
                    message: 'Registration successful',
                    user: { email: response.UserSub }
                };

            } catch (error) {
                return {
                    success: false,
                    message: error.message
                };
            }
        },
        login: async (_, { input }) => {

            const SECRET_HASH = computeSecretHash(ClientId, clientSecret, input.email);


            const params = {
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId,
                AuthParameters: {
                    USERNAME: input.email,
                    PASSWORD: input.password,
                    SECRET_HASH
                },
            };

            try {
                const response = await cognito.initiateAuth(params).promise();
                return {
                    success: true,
                    message: 'Login successful',
                    token: response.AuthenticationResult.IdToken, // or AccessToken, depending on your needs
                    user: { email: input.email }
                };
            } catch (error) {
                return {
                    success: false,
                    message: error.message
                };
            }
        }
    }
};

// ... (other imports and definitions remain the same)

const apolloServer = new ApolloServer({ typeDefs, resolvers });

export const config = {
    api: {
        bodyParser: false,
    },
};

// Use Next.js API route handler to start the Apollo Server and create the handler
export default async (req, res) => {
    try {
        if (apolloServer.state.phase !== 'started') await apolloServer.start();
        return apolloServer.createHandler({ path: '/api/graphql' })(req, res);
    }
    catch (ex) {
        const a = 0;
    }
};
