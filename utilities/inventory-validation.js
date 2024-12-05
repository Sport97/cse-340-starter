const invModel = require("../models/inventory-model");
const utilities = require("../utilities/index");
const { body, validationResult } = require("express-validator");
const validate = {};

validate.classifRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide classification.")
      .custom(async (classification_name) => {
        const classifExists = await invModel.checkExistingClassification(
          classification_name
        );
        if (classifExists) {
          throw new Error(
            "Classification exists. Please create a different classification."
          );
        }
      }),
  ];
};

validate.invRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."),

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a year."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."),

    body("inv_image")
      .notEmpty()
      .withMessage("Image path is required.")
      .withMessage(
        "Image path must start with '/images/vehicles/' and have a valid file name extension."
      ),

    body("inv_thumbnail")
      .notEmpty()
      .withMessage("Image path is required.")
      .withMessage(
        "Image path must start with '/images/vehicles/' and have a valid file name extension."
      ),

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Please provide price."),

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Please provide miles."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide color."),

    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),
  ];
};

validate.newInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a model."),

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a year."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."),

    body("inv_image")
      .notEmpty()
      .withMessage("Image path is required.")
      .withMessage(
        "Image path must start with '/images/vehicles/' and have a valid file name extension."
      ),

    body("inv_thumbnail")
      .notEmpty()
      .withMessage("Image path is required.")
      .withMessage(
        "Image path must start with '/images/vehicles/' and have a valid file name extension."
      ),

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Please provide price."),

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Please provide miles."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide color."),

    body("classification_id")
      .notEmpty()
      .withMessage("Please choose a classification."),
  ];
};

validate.checkClassifData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

validate.checkInvData = async (req, res, next) => {
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
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationList,
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
    return;
  }
  next();
};

validate.checkUpdateData = async (req, res, next) => {
  const {
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
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit Inventory",
      nav,
      classificationList,
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
    return;
  }
  next();
};

module.exports = validate;
