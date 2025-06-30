const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Update completedAt when completed status changes
todoSchema.pre("save", function (next) {
  if (this.isModified("completed")) {
    this.completedAt = this.completed ? new Date() : null;
  }
  next();
});

module.exports = mongoose.model("Todo", todoSchema);
