import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import { User } from "./user";
import cors from "cors";
import JWTService from "../services/jwt";
import { GraphQlContext } from "../interfaces";
import { Tweet } from "./tweet";

export async function initServer() {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  const server = new ApolloServer<GraphQlContext>({
    typeDefs: `
        ${User.types}

        ${Tweet.types}
        
        ${User.queries}
        ${User.queries}
        type Query{
          ${Tweet.queries}
        }
        
        type Mutation{
          ${Tweet.mutation}
          ${User.mutations}
        }
          
        `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries
      },
      Mutation: {
        ...Tweet.resolvers.mutations,
        ...User.resolvers.mutations
      },
      ...Tweet.resolvers.extraResolvers,
      ...User.resolvers.extraResolvers
    },
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeTonken(req.headers.authorization)
            : undefined,
        };
      },
    })
  );

  return app;
}
