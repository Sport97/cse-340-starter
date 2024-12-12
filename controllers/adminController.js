const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const adminModel = require("../models/admin-model");
const utilities = require("../utilities/");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("dotenv").config();

async function buildDashboard(req, res, next) {
  let nav = await utilities.getNav();
  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    nav,
    errors: null,
  });
}

async function buildManageClassification(req, res, next) {
  let nav = await utilities.getNav();
  let unapprovedClassifications =
    await utilities.getUnapprovedClasssifications();
  res.render("admin/manage-classification", {
    title: "Manage Classification",
    nav,
    unapprovedClassifications,
    errors: null,
  });
}

async function approveClassification(req, res) {
  let unapprovedClassifications =
    await utilities.getUnapprovedClasssifications();
  const { classification_id } = req.body;
  const { account_type, account_id } = res.locals.accountData;

  if (account_type === "Admin") {
    const result = await adminModel.approveClassification(
      classification_id,
      account_id
    );

    if (result) {
      let nav = await utilities.getNav();
      req.flash(
        "notice",
        `Classification '${result.rows[0].classification_name}' has been successfully approved.`
      );
      return res.status(200).render("admin/dashboard", {
        title: "Admin Dashboard",
        nav,
        errors: null,
      });
    } else {
      req.flash(
        "notice",
        "Failed to approve the classification. Please try again later."
      );
      return res.status(500).render("admin/manage-classification", {
        title: "Manage Classification",
        nav,
        unapprovedClassifications,
        errors: null,
      });
    }
  }
}

async function deleteClassification(req, res, next) {
  let unapprovedClassifications =
    await utilities.getUnapprovedClasssifications();
  const { classification_id } = req.body;
  const deleteResult = await adminModel.deleteClassification(classification_id);

  if (deleteResult) {
    let nav = await utilities.getNav();
    req.flash(
      "notice",
      `Classification ${classification_id} was successfully deleted.`
    );
    res.status(201).render("admin/dashboard", {
      title: "Admin Dashboard",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the removal failed.");
    res.status(501).render("manage-classification", {
      title: `Delete Item ${classification_id}`,
      nav,
      unapprovedClassifications,
      errors: null,
      classification_id,
    });
  }
}

module.exports = {
  buildDashboard,
  buildManageClassification,
  approveClassification,
  deleteClassification,
};
