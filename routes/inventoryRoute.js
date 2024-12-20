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
  "/",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement)
);

router.get(
  "/add-classification",
  utilities.checkAccountType,
  utilities.handleErrors(invController.addClassification)
);
router.get(
  "/add-inventory",
  utilities.checkAccountType,
  utilities.handleErrors(invController.addInventory)
);

router.post(
  "/add-classification",
  invValidate.classifRules(),
  invValidate.checkClassifData,
  utilities.checkAccountType,
  utilities.handleErrors(invController.newClassification)
);
router.post(
  "/add-inventory",
  invValidate.invRules(),
  invValidate.checkInvData,
  utilities.checkAccountType,
  utilities.handleErrors(invController.newInventory)
);

router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON)
);

router.get(
  "/edit/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.editInventoryView)
);

router.post(
  "/update",
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.checkAccountType,
  utilities.handleErrors(invController.updateInventory)
);

router.get(
  "/delete/:inv_id",
  utilities.checkAdminOnly,
  utilities.handleErrors(invController.deleteInventoryView)
);

router.post(
  "/delete",
  utilities.checkAdminOnly,
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;
