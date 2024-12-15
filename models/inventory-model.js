const pool = require("../database/");

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1 AND i.inv_approved = true`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

async function getInventoryByVehicleId(vehicle_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      WHERE i.inv_id = $1 AND i.inv_approved = true`,
      [vehicle_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getvehiclesbyid error " + error);
  }
}

async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const classif_name = await pool.query(sql, [classification_name]);
    return classif_name.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    `SELECT c.*
     FROM public.classification AS c
     JOIN public.inventory AS i
     ON c.classification_id = i.classification_id
     WHERE c.classification_approved = true AND i.inv_approved = true
     GROUP BY c.classification_id
     ORDER BY c.classification_name`
  );
}

async function getNewClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification WHERE classification_approved = true ORDER BY classification_name"
  );
}

async function requestClassificationApproval(classification_name) {
  return await pool.query(
    `INSERT INTO classification (classification_name, classification_approved, account_id)
    VALUES ($1, $2, NULL) -- account_id is NULL
    RETURNING classification_id`,
    [classification_name, false]
  );
}

async function requestInventoryApproval(
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
) {
  return await pool.query(
    `INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_approved, account_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NULL) -- account_id is NULL
    RETURNING inv_id`,
    [
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
      false,
    ]
  );
}

async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
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
      inv_id,
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
  }
}

module.exports = {
  getInventoryByClassificationId,
  getInventoryByVehicleId,
  checkExistingClassification,
  getClassifications,
  getNewClassifications,
  requestClassificationApproval,
  requestInventoryApproval,
  updateInventory,
};
