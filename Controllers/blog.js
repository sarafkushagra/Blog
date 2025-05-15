const Blog = require('../models/blogs');
const {isLoggedIn} = require('../middleware');
// Create a new blog
module.exports.newBlog = async (req, res) => {
    const newblog = new Blog(req.body.blog);
    newblog.owner = req.user._id;
    console.log(req.user._id);
    console.log(newblog);
    await newblog.save();
    res.redirect('/blog');
}
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
module.exports.showOneBlog = async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id).populate('owner');
    if (!blog) {
        req.flash("error", "Blog NOT FOUND");
        res.redirect("/blog");
    }
    console.log(blog);
    res.render('blogings/show.ejs', { blog });
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