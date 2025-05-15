const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: String,
    description: String,    
    content: String,
    date: { type: Date, default: Date.now },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;