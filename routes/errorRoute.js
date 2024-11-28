const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const errorController = require("../controllers/errorController");

// Intentional error route
router.get(
  "/trigger-error",
  utilities.handleErrors(errorController.triggerError)
);

module.exports = router;
