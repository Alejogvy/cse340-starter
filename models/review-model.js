const pool = require("../database/");

/* ****************************************
 *  Get all reviews for a specific vehicle
 * ************************************* */
async function getReviewsByVehicleId(inv_id) {
  try {
    const result = await pool.query(
      `SELECT review_id, reviewer_name, review_content, rating, 
              TO_CHAR(review_date, 'YYYY-MM-DD HH24:MI') AS formatted_date 
       FROM reviews 
       WHERE inv_id = $1 
       ORDER BY review_date DESC`,
      [inv_id]
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error("Failed to fetch reviews.");
  }
}

/* ******************
 *  Add a new review
 * **************** */
async function addReview(inv_id, reviewer_name, review_content, rating) {
  try {
    const result = await pool.query(
      `INSERT INTO reviews (inv_id, reviewer_name, review_content, rating)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [inv_id, reviewer_name, review_content, rating]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting review:", error);
    throw new Error("Failed to submit review.");
  }
}

module.exports = {
  getReviewsByVehicleId,
  addReview
};
