module.exports = {
    notes: async (parent, args, { models }) => {
        return await models.Note.find().limit(100);
    },
    note: async (parent, args, { models }) => {
        return await models.Note.findById(args.id);
    },
    user: async (parent, { username }, { models }) => {
        // find a user by username
        return await models.User.findOne({ username });
    },
    users: async (parent, args, { models }) => {
        // find all users
        return await models.User.find({});
    },
    me: async (parent, args, { models, user }) => {
        // find user by current user context
        return await models.User.findById(user.id);
    },

    noteFeed: async (parent, { cursor }, { models } ) => {
        // the limit of items
        const limit = 10;
        let hasNextPage = false;

        // if no cursor passed, the default query will be empty
        // this will pull the newest notes from the db
        let cursorQuery = {};

        // if there is cursor, get notes with an ObjectId less than of the cursor
        if (cursor) {
            cursorQuery = { _id: {$lt: cursor } };
        }

        // find the limit + 1 notes in our db, sorted newest to oldest
        let notes = await models.Note.find(cursorQuery)
                                    .sort({ _id: -1 })
                                    .limit(limit + 1);

        // if notes exceeds our limites, set hasNextPage to true
        // and trim notes to the limit
        if (notes.length > limit) {
            hasNextPage = true;
            notes = notes.slice(0, -1);
        }

        // the new cursor will be Mongo ObjectID of the last item in the feed array
        const newCursor = notes[notes.length - 1]._id;

        return {
            notes,
            cursor: newCursor,
            hasNextPage
        };
    }
};