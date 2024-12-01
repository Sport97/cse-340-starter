const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  });
};

invCont.buildByVehicleId = async function (req, res, next) {
  try {
    const vehicle_id = req.params.vehicleId;
    const data = await invModel.getInventoryByVehicleId(vehicle_id);
    const detail = await utilities.buildVehicleDetail(data);
    let nav = await utilities.getNav();
    const vehicleName = `${data[0].inv_year} ${data[0].inv_make}`;
    res.render("./inventory/vehicle", {
      title: vehicleName,
      nav,
      detail,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Management",
    nav,
    errors: null,
  });
};

invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
  });
};

invCont.newClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  const regResult = await invModel.newClassification(classification_name);

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you created new classification ${classification_name}.`
    );
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, add classification failed.");
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};

invCont.newInventory = async function (req, res) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const regResult = await invModel.newInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you created new inventory for ${inv_year}  ${inv_make}.`
    );
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, add classification failed.");
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
    });
  }
};

module.exports = invCont;
