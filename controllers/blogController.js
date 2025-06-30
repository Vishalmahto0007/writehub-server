const Blog = require("../models/Blog");

exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 9, search = "", sortBy = "latest" } = req.query;
    const skip = (page - 1) * limit;

    let query = { author: req.user._id };
    if (search) {
      query.$text = { $search: search };
    }

    let sort = {};
    if (sortBy === "oldest") {
      sort.createdAt = 1;
    } else {
      sort.createdAt = -1;
    }

    const blogs = await Blog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "username");

    const total = await Blog.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      posts: blogs.map((blog) => ({
        id: blog._id,
        title: blog.title,
        content: blog.content,
        imageUrl: blog.imageUrl,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      })),
      pagination: {
        page: parseInt(page),
        totalPages,
        total,
      },
    });
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      author: req.user._id,
    }).populate("author", "username");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      imageUrl: blog.imageUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    });
  } catch (error) {
    console.error("Get blog error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;

    const blog = new Blog({
      title,
      content,
      imageUrl,
      author: req.user._id,
    });

    await blog.save();

    res.status(201).json({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      imageUrl: blog.imageUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;

    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      { title, content, imageUrl },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({
      id: blog._id,
      title: blog.title,
      content: blog.content,
      imageUrl: blog.imageUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
