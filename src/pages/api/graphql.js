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
    _empty: String
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

  type User {
      email: String!
  }

  type Mutation {
    login(input: LoginInput!): LoginResponse!
  }
  
  input LoginInput {
    email: String!
    password: String!
  }
  
  type LoginResponse {
    success: Boolean!
    message: String!
    token: String
    user: User
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
  await apolloServer.start();
  return apolloServer.createHandler({ path: '/api/graphql' })(req, res);
};
