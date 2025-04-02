const pool = require("../database/");

const invModel = {};

/* *******************
 *  Add new inventory
 * ***************** */
invModel.addInventoryItem = async (vehicleData) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = vehicleData;

  const sql = `
    INSERT INTO inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  return pool.query(sql, [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color]);
};


/* ***************************
 *  Insert New Classification
 * ************************** */
invModel.insertClassification = async function (classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("Database error inserting classification:", error);
    throw error;
  }
};

/* ***************************
 *  Get all classification data
 * ************************** */
invModel.getClassifications = async function () {
  try {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
  } catch (error) {
    console.error("Error in getClassifications:", error);
    throw error;
  }
};

/* ***************************************************
 *  Get inventory items by classification_id with join
 * ************************************************* */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name 
       FROM inventory AS i
       JOIN classification AS c 
         ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    
    if (!data.rows || data.rows.length === 0) {
      throw new Error("No vehicles found for this classification.");
    }

    return data.rows;
  } catch (error) {
    console.error("Error in getInventoryByClassificationId:", error);
    throw error;
  }
};

/* ***************************
 *  Get vehicle details by ID
 * ************************** */
invModel.getVehicleById = async function (inv_id) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM inventory 
       WHERE inv_id = $1`,
      [inv_id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error(`Error getting vehicle ${inv_id}:`, error);
    throw error;
  }
};

module.exports = invModel;
