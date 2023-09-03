import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "graphql-tag";
import { RecipeResolver } from "@/server/resolver";
import { buildSchema } from "type-graphql";
import { Container } from "typedi";
import { MongoClient } from "mongodb";
import { MongoRepository, PayonPC, RagnApi } from "@/server/providers";

/* Loaders */

// Repositories
Container.set(PayonPC, new PayonPC());
Container.set(RagnApi, new RagnApi());
const connection = await MongoClient.connect(process.env.MONGO_URL!);
Container.set(
  MongoRepository,
  new MongoRepository(connection.db("ragnanalytics"))
);

// Services
// ...

const schema = await buildSchema({
  // Array of resolvers
  resolvers: [RecipeResolver],

  // Registry 3rd party IOC container
  container: Container,
});

const apolloServer = new ApolloServer({
  schema,
  // formatError
});
export default startServerAndCreateNextHandler(apolloServer);
