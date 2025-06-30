const express = require("express");
const noteController = require("../controllers/notesController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, noteController.getNotes);
router.post("/", isAuth, noteController.createNote);
router.put("/:id", isAuth, noteController.updateNote);
router.delete("/:id", isAuth, noteController.deleteNote);

module.exports = router;
