import { gql } from '@apollo/client';


export const typeDefs = gql`

type Article {
  article_id: ID!
  title: String!
  content: String!
  author_id: Int!
  created_at: String!
}

type Query {
  articles: [Article!]!
  article(article_id: ID!): Article!
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
      username: String!
  }

  type Mutation {
    login(input: LoginInput!): LoginResponse!
  }
  
  input LoginInput {
    username: String!
    password: String!
  }
  
  type LoginResponse {
    success: Boolean!
    message: String!
    token: String
    user: User
  }
   
`;