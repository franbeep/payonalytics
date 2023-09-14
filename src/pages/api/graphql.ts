import 'reflect-metadata';

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import {
  ItemMutationResolver,
  ItemHistoryQueryResolver,
  ItemVendingQueryResolver,
  ItemMiscQueryResolver,
} from '@/server/resolvers';
import { buildSchema } from 'type-graphql';
import { Container } from 'typedi';
import { MongoClient } from 'mongodb';
import { MongoRepository, PayonPC, RagnApi } from '@/server/providers';

/* Loaders */

// Repositories
const payonPC = new PayonPC();
Container.set(PayonPC, payonPC);

const connection = await MongoClient.connect(process.env.MONGO_URL!);

const mongoRepo = new MongoRepository(connection.db('ragnanalytics'));
Container.set(MongoRepository, mongoRepo);

const schema = await buildSchema({
  // Array of resolvers
  resolvers: [
    ItemMutationResolver,
    ItemHistoryQueryResolver,
    ItemVendingQueryResolver,
    ItemMiscQueryResolver,
  ],

  // Registry 3rd party IOC container
  container: Container,
});

const apolloServer = new ApolloServer({
  schema,
  // formatError
});

export default startServerAndCreateNextHandler(apolloServer);
