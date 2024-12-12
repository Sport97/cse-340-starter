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
  "/manage-classification",
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

module.exports = router;
