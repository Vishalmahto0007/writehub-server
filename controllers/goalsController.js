const Goal = require("../models/Goal");

exports.createGoal = async (req, res) => {
  const { title, content, targetDate, status } = req.body;
  try {
    const goal = new Goal({
      userId: req.userId,
      title,
      content,
      targetDate,
      status,
      author: req.user._id,
    });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: "Creating goal failed", error: err });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ author: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(
      goals.map((goal) => ({
        id: goal._id,
        title: goal.title,
        content: goal.content,
        targetDate: goal.targetDate,
        status: goal.status,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      }))
    );
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateGoal = async (req, res) => {
  const { id } = req.params;
  const { title, content, targetDate, status } = req.body;

  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: id, author: req.user._id },
      { title, content, targetDate, status },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({
      id: goal._id,
      title: goal.title,
      content: goal.content,
      targetDate: goal.targetDate,
      status: goal.status,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    });
  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({ message: "Failed to update goal", error });
  }
};

exports.deleteGoal = async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findOneAndDelete({ _id: id, author: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res
      .status(200)
      .json({ message: "Goal deleted successfully", id: goal._id });
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({ message: "Failed to delete goal", error });
  }
};
