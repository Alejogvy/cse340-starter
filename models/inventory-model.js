const db = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    return await db.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
  } catch (error) {
    console.error("Error in getClassifications:", error);
    throw error;
  }
}

/* ***************************
 *  Get inventory items by classification_id with join
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    console.log(`Looking for inventory to classification_id: ${classification_id}`);
    
    const data = await db.query(
      `SELECT i.*, c.classification_name 
       FROM inventory AS i
       JOIN classification AS c 
         ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    
    
    console.log(`Vehicles found: ${data.rows.length}`);
    
    return data.rows;
  } catch (error) {
    console.error("Error in getInventoryByClassificationId:", error);
    throw error;
  }
}

/* ***************************
 *  Get vehicle details by ID
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const { rows } = await db.query(
      `SELECT * FROM inventory 
       WHERE inv_id = $1`,
      [inv_id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error(`Error getting vehicle ${inv_id}:`, error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById
};