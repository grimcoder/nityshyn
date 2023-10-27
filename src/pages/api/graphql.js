import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { ApolloServer } from '@apollo/server';

import { typeDefs } from '@/app/lib/typeDefs';
import resolvers from '@/app/lib/resolvers';

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

export default startServerAndCreateNextHandler(server, {
  context: async (req, res) => { 
    // console.log(req.body)
  },
});