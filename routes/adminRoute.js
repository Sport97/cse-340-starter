const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const adminController = require("../controllers/adminController");

router.get(
  "/",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.buildManagement)
);

router.get(
  "/approve-classification",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.buildManageClassification)
);

router.post(
  "/approve-classification",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.approveClassification)
);

router.get(
  "/delete-classification",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.buildDeleteClassification)
);

router.post(
  "/delete-classification",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.deleteClassification)
);

router.get(
  "/approve-inventory",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.buildApproveInventory)
);

router.post(
  "/approve-inventory",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.approveInventory)
);

router.post(
  "/delete-inventory",
  utilities.checkAdminOnly,
  utilities.handleErrors(adminController.deleteInventory)
);

module.exports = router;
