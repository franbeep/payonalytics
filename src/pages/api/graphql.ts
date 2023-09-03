import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "graphql-tag";
import { RecipeResolver } from "@/server/resolver";
import { buildSchema } from "type-graphql";

const schema = await buildSchema({
  resolvers: [RecipeResolver],
});

const apolloServer = new ApolloServer({
  schema,
});
export default startServerAndCreateNextHandler(apolloServer);
