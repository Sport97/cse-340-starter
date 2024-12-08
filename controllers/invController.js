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
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationList,
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
  const { classification_name } = req.body;

  const regResult = await invModel.newClassification(classification_name);

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you created new classification ${classification_name}.`
    );
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      errors: null,
    });
  } else {
    let nav = await utilities.getNav();
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
      title: "Inventory Management",
      nav,
      classificationList,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, add inventory failed.");
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryByVehicleId(inv_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_description: itemData[0].inv_description,
    inv_image: itemData[0].inv_image,
    inv_thumbnail: itemData[0].inv_thumbnail,
    inv_price: itemData[0].inv_price,
    inv_miles: itemData[0].inv_miles,
    inv_color: itemData[0].inv_color,
    classification_id: itemData[0].classification_id,
  });
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    // res.redirect("/inv/");
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      errors: null,
    });
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
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
    });
  }
};

invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryByVehicleId(inv_id);
  const itemName = `${itemData[0].inv_make} ${itemData[0].inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: "Edit " + itemName,
    nav,
    errors: null,
    inv_id: itemData[0].inv_id,
    inv_make: itemData[0].inv_make,
    inv_model: itemData[0].inv_model,
    inv_year: itemData[0].inv_year,
    inv_price: itemData[0].inv_price,
  });
};

invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  const { inv_id } = req.body;
  const deleteResult = await invModel.deleteInventory(inv_id);

  if (deleteResult) {
    req.flash("notice", `Item ${inv_id} was successfully deleted.`);
    // res.redirect("/inv/");
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the removal failed.");
    res.status(501).render("inventory/delete-confirm", {
      title: `Delete Item ${itemId}`,
      nav,
      errors: null,
      inv_id,
    });
  }
};

module.exports = invCont;
