const express = require("express");
const dashboardController = require("../controllers/dashboardController");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", isAuth, dashboardController.getLatestItems);

module.exports = router;
