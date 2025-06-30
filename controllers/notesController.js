const Note = require("../models/Note");
const mongoose = require("mongoose");

exports.getNotes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      search = "",
      type = "all",
      sortBy = "latest",
    } = req.query;
    const skip = (page - 1) * limit;

    let query = { author: req.user._id };
    if (search) {
      query.$text = { $search: search };
    }
    if (type !== "all") {
      query.type = type;
    }

    let sort = {};
    if (sortBy === "oldest") {
      sort.createdAt = 1;
    } else {
      sort.createdAt = -1;
    }

    const notes = await Note.find(query)
      .sort(sort)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      notes: notes.map((note) => ({
        id: note._id,
        title: note.title,
        content: note.content,
        type: note.type,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
      pagination: {
        page: parseInt(page),
        totalPages,
        total,
      },
    });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, type } = req.body;

    const note = new Note({
      title,
      content,
      type,
      author: req.user._id,
    });

    await note.save();

    res.status(201).json({
      id: note._id,
      title: note.title,
      content: note.content,
      type: note.type,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }

    if (!title || !content || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, author: req.user._id },
      { title, content, type },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({
      id: note._id,
      title: note.title,
      content: note.content,
      type: note.type,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
