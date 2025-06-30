const express = require("express");
const todoController = require("../controllers/todoController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, todoController.getTodos);
router.post("/", isAuth, todoController.createTodo);
router.put("/:id", isAuth, todoController.updateTodo);
router.delete("/:id", isAuth, todoController.deleteTodo);

module.exports = router;
