const express = require("express");
const blogController = require("../controllers/blogController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, blogController.getBlogs);
router.get("/:id", isAuth, blogController.getBlog);
router.post("/", isAuth, blogController.createBlog);
router.put("/:id", isAuth, blogController.updateBlog);
router.delete("/:id", isAuth, blogController.deleteBlog);

module.exports = router;
