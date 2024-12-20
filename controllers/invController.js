const invModel = require("../models/inventory-model");
const adminModel = require("../models/admin-model");
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
  let newClassificationList = await utilities.buildNewClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    newClassificationList,
    errors: null,
  });
};

invCont.newClassification = async function (req, res) {
  const { classification_name } = req.body;
  const { account_type, account_id } = res.locals.accountData;

  try {
    if (account_type === "Admin") {
      const regResult = await adminModel.newClassification(
        classification_name,
        account_id
      );

      if (regResult) {
        let nav = await utilities.getNav();
        req.flash(
          "notice",
          `Congratulations, you created new classification ${classification_name}.`
        );

        let classificationList = await utilities.buildClassificationList();
        return res.status(201).render("inventory/management", {
          title: "Inventory Management",
          nav,
          classificationList,
          errors: null,
        });
      } else {
        let nav = await utilities.getNav();
        req.flash("notice", "Sorry, adding classification failed.");
        return res.status(501).render("inventory/add-classification", {
          title: "Add Classification",
          nav,
          errors: null,
        });
      }
    } else {
      const requestResult = await invModel.requestClassificationApproval(
        classification_name
      );

      if (requestResult) {
        let nav = await utilities.getNav();
        req.flash(
          "notice",
          `Your request for classification '${classification_name}' has been submitted for approval.`
        );
        let classificationList = await utilities.buildClassificationList();
        return res.status(200).render("inventory/management", {
          title: "Inventory Management",
          nav,
          classificationList,
          errors: null,
        });
      } else {
        let nav = await utilities.getNav();
        req.flash(
          "notice",
          "Sorry, your request could not be submitted. Please try again."
        );
        return res.status(500).render("inventory/add-classification", {
          title: "Add Classification",
          nav,
          errors: null,
        });
      }
    }
  } catch (error) {
    console.error("Error processing classification request:", error);
    req.flash("notice", "An unexpected error occurred. Please try again.");
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};

invCont.newInventory = async function (req, res) {
  const { account_type, account_id } = res.locals.accountData;
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

  if (account_type === "Admin") {
    const regResult = await adminModel.newInventory(
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
      account_id
    );

    if (regResult) {
      let nav = await utilities.getNav();
      let classificationList = await utilities.buildClassificationList();
      req.flash(
        "notice",
        `Congratulations, you created new inventory for ${inv_year} ${inv_make}.`
      );
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        classificationList,
        errors: null,
      });
    } else {
      let nav = await utilities.getNav();
      let newClassificationList = await utilities.buildNewClassificationList();
      req.flash("notice", "Sorry, add inventory failed.");
      res.status(501).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        newClassificationList,
        errors: null,
      });
    }
  } else {
    const regResult = await invModel.requestInventoryApproval(
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
      let nav = await utilities.getNav();
      let classificationList = await utilities.buildClassificationList();
      req.flash(
        "notice",
        `Your request for new inventory (${inv_year} ${inv_make}) has been submitted for admin approval.`
      );
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        classificationList,
        errors: null,
      });
    } else {
      let nav = await utilities.getNav();
      let newClassificationList = await utilities.buildNewClassificationList();
      req.flash("notice", "Sorry, inventory request failed.");
      res.status(501).render("inventory/add-inventory", {
        title: "Add Inventory Request",
        nav,
        newClassificationList,
        errors: null,
      });
    }
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
  const { inv_id } = req.body;
  const deleteResult = await adminModel.deleteInventory(inv_id);

  if (deleteResult) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    req.flash("notice", `Item ${inv_id} was successfully deleted.`);
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      errors: null,
    });
  } else {
    let nav = await utilities.getNav();
    req.flash("notice", "Sorry, the removal failed.");
    res.status(501).render("inventory/delete-confirm", {
      title: `Delete Item ${inv_id}`,
      nav,
      errors: null,
      inv_id,
    });
  }
};

module.exports = invCont;
