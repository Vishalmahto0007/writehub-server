const Blog = require("../models/Blog");
const Todo = require("../models/Todo");
const Note = require("../models/Note");
const Goal = require("../models/Goal");

exports.getLatestItems = async (req, res) => {
  try {
    const userId = req.userId;

    const findItems = async (Model, type, path) => {
      const items = await Model.find({ author: userId })
        .sort({ createdAt: -1 })
        .lean();
      return items.map((item) => ({ ...item, type, path }));
    };

    const [blogs, todos, notes, goals] = await Promise.all([
      findItems(Blog, "blog", "/blog"),
      findItems(Todo, "todo", "/todo"),
      findItems(Note, "note", "/notes"),
      findItems(Goal, "goal", "/goals"),
    ]);

    const datasets = [blogs, todos, notes, goals];

    const onePerType = datasets.flatMap((items) =>
      items.length > 0 ? [items[0]] : []
    );

    const usedIds = new Set(onePerType.map((item) => String(item._id)));

    const extraItems = datasets
      .flat()
      .filter((item) => !usedIds.has(String(item._id)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const finalItems = [...onePerType, ...extraItems].slice(0, 6);

    const [blogsCount, todosCount, notesCount, goalsCount] = await Promise.all([
      Blog.countDocuments({ author: userId }),
      Todo.countDocuments({ author: userId }),
      Note.countDocuments({ author: userId }),
      Goal.countDocuments({ author: userId }),
    ]);

    const [incompleteTodos, startedGoals] = await Promise.all([
      Todo.countDocuments({ author: userId, completed: false }),
      Goal.countDocuments({ author: userId, status: "start" }),
    ]);

    res.status(200).json({
      latest: finalItems,
      counts: {
        blogs: blogsCount,
        todos: todosCount,
        notes: notesCount,
        goals: goalsCount,
        incompleteTodos,
        startedGoals,
      },
    });
  } catch (err) {
    console.error("getLatestItems error:", err);
    res.status(500).json({
      message: "Something went wrong. Please try again later.",
      error: err.message,
    });
  }
};
