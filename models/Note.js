const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["personal", "work", "study", "ideas", "reminders", "others"],
      default: "personal",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
noteSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Note", noteSchema);
