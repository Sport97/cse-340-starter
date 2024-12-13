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
    title: "Admin Management",
    nav,
    errors: null,
  });
}

async function buildManageClassification(req, res, next) {
  let nav = await utilities.getNav();
  let unapprovedClassifications =
    await utilities.getUnapprovedClasssifications();
  res.render("admin/approve-classification", {
    title: "Approve Classification",
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
      return res.status(500).render("admin/approve-classification", {
        title: "Approve Classification",
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
    let nav = await utilities.getNav();
    req.flash(
      "notice",
      "The removal failed. Check if Classification has existing items"
    );
    res.status(501).render("admin/approve-classification", {
      title: "Approve Classification",
      nav,
      unapprovedClassifications,
      errors: null,
      classification_id,
    });
  }
}

async function buildApproveInventory(req, res, next) {
  let nav = await utilities.getNav();
  let unapprovedInventory = await utilities.getUnapprovedInventory();
  res.render("admin/approve-inventory", {
    title: "Approve Inventory",
    nav,
    unapprovedInventory,
    errors: null,
  });
}

async function approveInventory(req, res) {
  let unapprovedInventory = await utilities.getUnapprovedInventory();
  const { inv_id } = req.body;
  const { account_type, account_id } = res.locals.accountData;

  if (account_type === "Admin") {
    const result = await adminModel.approveInventory(inv_id, account_id);

    if (result) {
      let nav = await utilities.getNav();
      req.flash(
        "notice",
        `Inventory '${result.rows[0].inv_make} ${result.rows[0].inv_model}' has been successfully approved.`
      );
      return res.status(200).render("admin/dashboard", {
        title: "Admin Dashboard",
        nav,
        errors: null,
      });
    } else {
      req.flash(
        "notice",
        "Failed to approve the inventory. Please try again later."
      );
      return res.status(500).render("admin/approve-inventory", {
        title: "Approve Inventory",
        nav,
        unapprovedInventory,
        errors: null,
      });
    }
  }
}

module.exports = {
  buildDashboard,
  buildManageClassification,
  approveClassification,
  deleteClassification,
  buildApproveInventory,
  approveInventory,
};
