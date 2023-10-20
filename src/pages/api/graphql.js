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
`;

const resolvers = {
    Mutation: {
        register: async (_, { input }) => {
            try {

                const ClientId = process.env.YOUR_COGNITO_APP_CLIENT_ID;
                const clientSecret = process.env.COGNITO_APP_CLIENT_SECRET;

                const SecretHash = computeSecretHash(ClientId, clientSecret, input.username);

                const params = {
                    ClientId,
                    Username: input.username,     // use the provided username
                    Password: input.password,
                    UserAttributes: [
                        {
                            Name: 'email',
                            Value: input.email  // provide the email as an attribute
                        }
                    ],
                    SecretHash  // if necessary, as mentioned in the previous response
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
