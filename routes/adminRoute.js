const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const adminController = require("../controllers/adminController");

router.get(
  "/",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.buildDashboard)
);

router.get(
  "/approve-classification",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.buildManageClassification)
);

router.post(
  "/approve-classification",
  utilities.handleErrors(adminController.approveClassification)
);

router.post(
  "/delete-classification",
  utilities.handleErrors(adminController.deleteClassification)
);

router.get(
  "/approve-inventory",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.buildApproveInventory)
);

router.post(
  "/approve-inventory",
  utilities.handleErrors(adminController.approveInventory)
);

module.exports = router;
