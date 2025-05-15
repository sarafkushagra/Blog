const express = require("express");
const router = express.Router();
const blogControllers = require("../Controllers/blog");

router.get("/blog/add", blogControllers.addBlog);
router.get("/blog", blogControllers.showAllBlog);
router.get("/blog/:id", blogControllers.showOneBlog);
router.get("/blog/:id/edit", blogControllers.editBlog);
router.post("/blog", blogControllers.newBlog);
router.put("/blog/:id", blogControllers.updateBlog);
router.delete("/blog/:id", blogControllers.deleteBlog);

module.exports = router;