const express = require('express');
const { ApolloServer } = require('apollo-server-express');
require('dotenv').config();

// local modules imports
const db = require('./db');
const models = require('./models');
// Construct a schema, using GraphQL schema language
const typeDefs = require('./schema');
// Provide resolver functions for our schema fields
const resolvers = require('./reslovers');

// Run the server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;
// Store the DB_HOST value as a variable
const DB_HOST = process.env.DB_HOST;

const app = express();

// Connect to the database
db.connect(DB_HOST);

// Apollo server setup
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => {
        // add the db models to the context
        return { models };
    }
});

// Apply the Apollo GraphQL middleware and set the path to /api
apolloServer.applyMiddleware({ app, path: '/api'});

app.listen(port, () => 
    console.log(
        `GraphQL Server running at htttp://localhost:${port}${apolloServer.graphqlPath}`
    )
);