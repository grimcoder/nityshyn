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

const ClientId = process.env.YOUR_COGNITO_APP_CLIENT_ID;
const clientSecret = process.env.COGNITO_APP_CLIENT_SECRET;

const resolvers = {
  Query: {
    articles: async () => {
      try {
        const articles = await query('SELECT * FROM articles');
        return articles;
      } catch (error) {
        throw new Error(`Failed to fetch articles: ${error.message}`);
      }
    },
    article: async (_, { article_id }) => {
      try {
        const articles = await query('SELECT * FROM articles WHERE article_id = ?', [article_id]);
        return articles[0];
      } catch (error) {
        throw new Error(`Failed to fetch article with ID ${article_id}: ${error.message}`);
      }
    },
  },
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
          user: { username: response.UserSub }
        };

      } catch (error) {
        return {
          success: false,
          message: error.message
        };
      }
    },
    login: async (_, { input }) => {

      const SECRET_HASH = computeSecretHash(ClientId, clientSecret, input.username);


      const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId,
        AuthParameters: {
          USERNAME: input.username,
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
          user: { username: input.username }
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


export default resolvers;