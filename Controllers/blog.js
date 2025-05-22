const Blog = require('../models/blogs');
const {isLoggedIn} = require('../middleware');
// Create a new blog
module.exports.newBlog = [isLoggedIn, async (req, res) => {
    try {
        const newblog = new Blog(req.body.blog);
        newblog.owner = req.user._id;
        await newblog.save();
        req.flash('success', 'Successfully created a new blog!');
        res.redirect('/blog');
    } catch (error) {
        console.error('Error creating blog:', error);
        req.flash('error', 'Failed to create blog. Please try again.');
        res.redirect('/blog/add');
    }
}];
// Add a new blog
module.exports.addBlog = [isLoggedIn, (req, res) => {
    req.flash("success", "Successfully made a new listing");
    res.render('blogings/add.ejs');
}];
// Show all blogs
module.exports.showAllBlog = async (req, res) => {
    const allBlogs = await Blog.find({});
    res.render('blogings/index.ejs', { allBlogs });
}
// Show one blog
module.exports.showOneBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findById(id).populate('owner');
        if (!blog) {
            req.flash("error", "Blog not found");
            return res.redirect("/blog");
        }
        res.render('blogings/show.ejs', { blog });
    } catch (err) {
        next(err);
    }
}
// Edit a blog
module.exports.editBlog = [isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) {
        req.flash("error", "Blog NOT FOUND");
        res.redirect("/blog");
    }
    res.render('blogings/edit.ejs', { blog });
}];
// Update a blog
module.exports.updateBlog = [isLoggedIn, async (req, res) => {
    let { id } = req.params;
    await Blog.findByIdAndUpdate(id, { ...req.body.blog });
    res.redirect(`/blog/${id}`);
}];
// Delete a blog
module.exports.deleteBlog = [isLoggedIn, async (req, res) => {
    let { id } = req.params;
    req.flash("success", "Successfully deleted the blog");
    await Blog.findByIdAndDelete(id);
    res.redirect('/blog');
}];