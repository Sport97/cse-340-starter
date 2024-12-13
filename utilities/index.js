const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const adminModel = require("../models/admin-model");
const jwt = require("jsonwebtoken");
const env = require("dotenv").config();
const Util = {};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

Util.buildVehicleDetail = async function (data) {
  let detail;
  if (data.length > 0) {
    detail = '<section class="vehicle-container">';
    detail += '<div id="image-container">';
    detail += `<img src="${data[0].inv_image}" alt="${data[0].inv_make} ${data[0].inv_model}">`;
    detail += '<div id="vehicle-details">';
    detail += `<h2>${data[0].inv_make} Details</h2>`;
    detail += `<p>$${new Intl.NumberFormat("en-US").format(
      data[0].inv_price
    )}</p>`;
    detail += `<p>${data[0].inv_description}</p>`;
    detail += `<p>${data[0].inv_color}</p>`;
    detail += `<p>${new Intl.NumberFormat("en-US").format(
      data[0].inv_miles
    )}</p>`;
    detail += "</div>";
    detail += "</div>";
    detail += "</section>";
  } else {
    detail = '<p class="notice">Sorry, no matching vehicle could be found.</p>';
  }
  return detail;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home detail">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        if (req.session.accountData) {
          res.locals.accountData = req.session.accountData;
        } else {
          res.locals.accountData = accountData;
        }
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin && res.locals.accountData) {
    const { account_type } = res.locals.accountData;
    if (account_type === "Admin" || account_type === "Employee") {
      return next();
    } else {
      req.flash("notice", "Access denied.");
      return res.redirect("/account/login");
    }
  } else {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }
};

Util.checkAccountId = (req, res, next) => {
  const account_id = parseInt(req.params.account_id);

  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }

  if (res.locals.accountData.account_id === account_id) {
    return next();
  } else {
    req.flash("notice", "Access denied.");
    return res.redirect("/account/login");
  }
};

Util.logout = (req, res) => {
  res.clearCookie("jwt");
  req.session.accountData = null;
  res.locals.accountData = null;
  req.flash("notice", "You have successfully logged out.");
  res.redirect("/");
};

Util.checkAdminOnly = (req, res, next) => {
  if (res.locals.loggedin && res.locals.accountData) {
    const { account_type } = res.locals.accountData;
    if (account_type === "Admin") {
      return next();
    } else {
      req.flash("notice", "Access denied.");
      return res.redirect("/account/login");
    }
  } else {
    req.flash("notice", "Please log in to access this page.");
    return res.redirect("/account/login");
  }
};

Util.buildUnapprovedClassifications = async function (req, res) {
  try {
    let unapprovedClassifications =
      await adminModel.getClassificationApproved();
    res.json(unapprovedClassifications.rows);
  } catch (error) {
    console.error("Error fetching unapproved classifications:", error);
    res.status(500).json({ error: "Failed to fetch classifications." });
  }
};

Util.getUnapprovedClasssifications = async function (req, res, next) {
  let data = await adminModel.getClassificationApproved();
  let list = `<div class="unapproved">`;

  data.rows.forEach((row) => {
    list += "<ul>";
    list += "<li>";
    list += `${row.classification_name}`;

    if (!row.classification_approved) {
      list += `
      <form class="admin-form" action="/admin/approve-classification" method="post">
        <input type="hidden" name="classification_id" value="${row.classification_id}" />
        <input type="submit" class="approveBtn" name="approveBtn" value="Approve" />
      </form>`;

      list += `
      <form class="admin-form" action="/admin/delete-classification" method="post">
        <input type="hidden" name="classification_id" value="${row.classification_id}" />
        <input type="submit" class="deleteBtn" name="deleteBtn" value="Delete" />
      </form>
    `;
      list += "</li>";
      list += "</ul>";
    }
  });
  list += "<p>No Classification Requests</p>";
  list += "</div>";
  return list;
};

Util.getUnapprovedInventory = async function (req, res, next) {
  let data = await adminModel.getInventoryApproved();
  let list = `<div class="unapproved">`;

  data.rows.forEach((row) => {
    list += "<ul>";
    list += "<li>";
    list += `${row.inv_make} ${row.inv_model}`;

    if (!row.inv_approved) {
      list += `
      <form class="admin-form" action="/admin/approve-inventory" method="post">
        <input type="hidden" name="inv_id" value="${row.inv_id}" />
        <input type="submit" class="approveBtn" name="approveBtn" value="Approve" />
      </form>`;

      list += `
      <form class="admin-form" action="/admin/delete-inventory" method="post">
        <input type="hidden" name="inv_id" value="${row.inv_id}" />
        <input type="submit" class="deleteBtn" name="deleteBtn" value="Delete" />
      </form>
    `;
      list += "</li>";
      list += "</ul>";
    }
  });
  list += "<p>No Inventory Requests</p>";
  list += "</div>";
  return list;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
