const pool = require("../database/");

async function getClassificationApproved() {
  return await pool.query(
    "SELECT * FROM public.classification WHERE classification_approved = false"
  );
}

async function approveClassification(classification_id, account_id) {
  return await pool.query(
    `UPDATE public.classification SET classification_approved = true, classification_approval_date = NOW(), account_id = $2 WHERE classification_id = $1 RETURNING classification_name`,
    [classification_id, account_id]
  );
}

async function newClassification(classification_name, account_id) {
  try {
    const sql = `INSERT INTO classification (classification_name, classification_approved, account_id)
      VALUES ($1, $2, $3)
      RETURNING classification_id`;
    return await pool.query(sql, [classification_name, true, account_id]);
  } catch (error) {
    return error.message;
  }
}

async function getUnusedClassifications() {
  return await pool.query(
    `SELECT c.*
    FROM public.classification AS c
    LEFT JOIN public.inventory AS i
    ON c.classification_id = i.classification_id
    WHERE c.classification_approved = true
    AND i.inv_id IS NULL
    GROUP BY c.classification_id
    ORDER BY c.classification_name;`
  );
}

async function deleteClassification(classification_id) {
  try {
    const sql = "DELETE FROM classification WHERE classification_id = $1";
    const data = await pool.query(sql, [classification_id]);
    return data;
  } catch (error) {
    new Error("Delete Classification Error");
  }
}

async function getInventoryApproved() {
  return await pool.query(
    "SELECT * FROM public.inventory WHERE inv_approved = false"
  );
}

async function approveInventory(inv_id, account_id) {
  return await pool.query(
    `UPDATE public.inventory SET inv_approved = true, inv_approved_date = NOW(), account_id = $2 WHERE inv_id = $1 RETURNING inv_make, inv_model`,
    [inv_id, account_id]
  );
}

async function newInventory(
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
) {
  try {
    const sql =
      "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_approved, account_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *";
    return await pool.query(sql, [
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
      true,
      account_id,
    ]);
  } catch (error) {
    return error.message;
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    new Error("Delete Inventory Error");
  }
}

module.exports = {
  getClassificationApproved,
  approveClassification,
  newClassification,
  getUnusedClassifications,
  deleteClassification,
  getInventoryApproved,
  approveInventory,
  newInventory,
  deleteInventory,
};
