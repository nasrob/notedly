const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const depthlimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');

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
app.use(helmet());
app.use(cors());
// Connect to the database
db.connect(DB_HOST);

// get the user info from a JWT
const getUser = token => {
    if (token) {
        try {
            // return user info from token
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // if there is a problem with token
            throw new Error('Session invalid');
        }
    }
}

// Apollo server setup
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    validationRules: [depthlimit(5), createComplexityLimitRule(1000)],
    context: ({ req }) => {
        // get user token from headers
        const token = req.headers.authorization;

        // try to retrieve a user with token
        const user = getUser(token);

        // add the db models and the user to the context
        return { models, user };
    }
});

// Apply the Apollo GraphQL middleware and set the path to /api
apolloServer.applyMiddleware({ app, path: '/api'});

app.listen(port, () => 
    console.log(
        `GraphQL Server running at htttp://localhost:${port}${apolloServer.graphqlPath}`
    )
);