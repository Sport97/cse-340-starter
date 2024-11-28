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

module.exports = invCont;
