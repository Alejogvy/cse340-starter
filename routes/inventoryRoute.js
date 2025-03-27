const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');

// Route to build inventory by classification view
router.get('/type/:classificationId', invController.buildByClassificationId);

// Route to build vehicle detail view
router.get('/detail/:invId', invController.getVehicleDetail);

// Test route for 500 error simulation
router.get("/test-error", (req, res, next) => {
  const error = new Error("Test Error 500");
  error.status = 500;
  next(error);
});

module.exports = router;