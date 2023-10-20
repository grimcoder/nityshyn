import { ApolloServer, gql } from 'apollo-server-micro';
import AWS from 'aws-sdk';
const YOUR_AWS_REGION = "us-west-1";

AWS.config.update({ region: YOUR_AWS_REGION });

const cognito = new AWS.CognitoIdentityServiceProvider();

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
  }

  type RegisterResponse {
      success: Boolean!
      message: String
      user: User
  }

  type User {
      email: String!
  }
`;

const resolvers = {
    Mutation: {
        register: async (_, { input }) => {
            try {
                const params = {
                    ClientId: 'YOUR_COGNITO_APP_CLIENT_ID',
                    Username: input.email,
                    Password: input.password
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
