const express = require("express");
const goalController = require("../controllers/goalsController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, goalController.getGoals);
router.post("/", isAuth, goalController.createGoal);
router.put("/:id", isAuth, goalController.updateGoal);
router.delete("/:id", isAuth, goalController.deleteGoal);

module.exports = router;
