const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const mongoose = require('mongoose');
require('dotenv').config;


const gravatar = require('../util/gravatar');

module.exports = {
    newNote: async (parent, args, { models, user }) => {
        // if there is no user on the context, throw an auth error
        if (!user) {
            throw new AuthenticationError('You must be signe in to create a note');
        }
        return await models.Note.create({
            content: args.content,
            // reference the autor's mongo id
            author: mongoose.Types.ObjectId(user.id)
        });
    },

    deleteNote: async (parent, { id }, { models }) => {
        if (!user) {
            throw new AuthenticationError('You must be signed in to delete a note');
        }
        
        // find the note
        const note = await models.Note.findById(id);

        // if note owner and current user don't match, htrow a forbidden error
        if (note && String(note.author) !== user.id) {
            throw new ForbiddenError("You don't have permissions to delete the note");
        }

        try {
            await note.remove();
            return true;
        } catch (error) {
            return false;
        }
    },

    updateNote: async (parent, { content, id }, { models }) => {
        if (!user) {
            throw new AuthenticationError('You must be signed in to update a note');
        }

        const note = await models.Note.findById(id);
        if (note && String(note.author !== user.id)) {
            throw new ForbiddenError("You don't have permissions to update the note");
        }

        return await models.Note.findOneAndUpdate(
            { _id: id },
            { $set: { content } },
            { new: true }
        );
    },

    signUp: async (parent, { username, email, password }, { models }) => {
        email = email.trim().toLowerCase(); // normalize email
        const hashed = await bcrypt.hash(password, 10); // hash the password
        // create the gravatar url
        const avatar = gravatar(email);

        try {
            const user = await models.User.create({
                username,
                email,
                avatar,
                password: hashed
            });

            // create and return the JWT
            return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        } catch (err) {
            console.error(err);
            // in case of failure
            throw new Error('Error creating account');
        }
    },

    signIn: async (parent, { username, email, password }, { models }) => {
        if (email) {
            email = email.trim().toLowerCase();
        }

        const user = await models.User.findOne({
            $or: [{ email }, { username }]
        });

        // if no user is found, throw an authentication error
        if (!user) {
            throw new AuthenticationError('Error signing in');
        }

        // if the passord don't match, throw an authentication error
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new AuthenticationError('Error signing in');
        }

        // create and return the jwt
        return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    }
};
