const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const nav = await utilities.getNav();

    if (!data || data.length === 0) {
      const message = `No vehicles found for classification ID: ${classification_id}`;
      console.log(message);
      return res.render("./inventory/classification", {
        title: "No Vehicles Found",
        nav,
        grid: '<p class="notice">No vehicles found in this classification.</p>',
        errors: null,
      });
    }

    const grid = await utilities.buildClassificationGrid(data);
    const className = data[0].classification_name || "Unknown Classification";

    res.render("./inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      grid,
      errors: null,
    });
  } catch (error) {
    console.error("Error in buildByClassificationId:", error);
    next(error);
  }
};

/* ***************************
 *  Get vehicle details
 * ************************** */
invCont.getVehicleDetail = async function (req, res, next) {
  try {
    const vehicle = await invModel.getVehicleById(req.params.invId);
    const nav = await utilities.getNav();
    
    if (!vehicle) {
      return res.status(404).render('errors/error', {
        title: 'Vehicle Not Found',
        message: 'The requested vehicle does not exist',
        nav
      });
    }

    res.render('inventory/detail', {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      vehicle,
      nav
    });
  } catch (error) {
    console.error('Error in getVehicleDetail:', error);
    next(error);
  }
};

module.exports = invCont;