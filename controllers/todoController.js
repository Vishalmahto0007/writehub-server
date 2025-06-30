const Todo = require("../models/Todo");

exports.createTodo = async (req, res) => {
  const { title, priority } = req.body;
  try {
    const todo = new Todo({ userId: req.userId, title, priority });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(500).json({ message: "Creating todo failed", error: err });
  }
};

exports.getTodos = async (req, res) => {
  const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.status(200).json(todos);
};

exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ author: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(
      todos.map((todo) => ({
        id: todo._id,
        title: todo.title,
        priority: todo.priority,
        completed: todo.completed,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Get todos error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createTodo = async (req, res) => {
  try {
    const { title, priority } = req.body;

    const todo = new Todo({
      title,
      priority,
      author: req.user._id,
    });

    await todo.save();

    res.status(201).json({
      id: todo._id,
      title: todo.title,
      priority: todo.priority,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    });
  } catch (error) {
    console.error("Create todo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const updates = req.body;

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, author: req.user._id },
      updates,
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({
      id: todo._id,
      title: todo.title,
      priority: todo.priority,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    });
  } catch (error) {
    console.error("Update todo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Delete todo error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
