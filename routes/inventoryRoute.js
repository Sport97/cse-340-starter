// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const invValidate = require("../utilities/inventory-validation");
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);
router.get(
  "/detail/:vehicleId",
  utilities.handleErrors(invController.buildByVehicleId)
);

router.get(
  "/management",
  utilities.handleErrors(invController.buildManagement)
);

router.get(
  "/add-classification",
  utilities.handleErrors(invController.addClassification)
);
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.addInventory)
);

router.post(
  "/add-classification",
  invValidate.classifRules(),
  invValidate.checkClassifData,
  utilities.handleErrors(invController.newClassification)
);
router.post(
  "/add-inventory",
  invValidate.invRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.newInventory)
);

module.exports = router;
