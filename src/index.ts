import dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import express from "express";
import http from "http";
import { buildSchema } from "type-graphql";
import cookieParser from "cookie-parser";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import connectToDB from "./utils/connectToDb";
import { verifyJwt } from "./utils/jwt";
import { User } from "./schema/user.schema";
import { resolvers } from "./resolvers";
import Context from "./types/context";
import authChecker from "./utils/authChecker";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

const bootstrap = async () => {
  // Build the schema
  const schema = await buildSchema({
    resolvers,
    authChecker,
  });

  // Init express
  const app = express();

  app.use(cookieParser());

  const httpServer = http.createServer(app);
  // Create the apollo server
  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })], // for graceful shutdown
  });
  await server.start();

  // Apply middleware to server
  app.use(
    "/",
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        let context: Context = {
          req,
          res,
          user: null,
        };

        if (req.cookies.accessToken) {
          const user = verifyJwt<User>(req.cookies.accessToken);

          context.user = user;
        }
        return context;
      },
    })
  );
  // app.listen on express server
  app.listen({ port: 4000 }, () => {
    console.log("App is listening on http://localhost:4000");
  });
  // Connect to db
  connectToDB();
};

bootstrap();
