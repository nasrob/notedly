const mongoose = require('mongoose');

// Define the note's database schema
const noteSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        author: { 
            type: mongoose.Schema.Types.ObjectId, 
            String, 
            required: true}
    },
    {
        // Assigns createdAt and updateAt fields with a Date type
        timestamps: true
    }
);

// Define the 'Note' model with the schema
const Note = mongoose.model('Note', noteSchema);

// export the module
module.exports = Note;