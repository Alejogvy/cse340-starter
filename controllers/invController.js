const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { getAllClassifications } = require('../models/inventory-model');
const { message } = require("statuses");

const invCont = {};

/* ***********************
 *  Process new inventory
 * ********************** */
invCont.addInventory = async (req, res) => {
  try {
    const classificationList = await getAllClassifications();
    const nav = await utilities.getNav();

    let navHTML = `
      <nav>
        <ul>
          <li><a href="${nav.home}">Home</a></li>
          <li><a href="${nav.inventory}">Inventory</a></li>
          <li><a href="${nav.addInventory}">Add Inventory</a></li>
          <li><a href="${nav.addClassification}">Add Classification</a></li>
        </ul>
      </nav>
    `;

    res.render('inventory/add-inventory', {
      classificationList: classificationList,
      nav: navHTML
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading page');
  }
};

/* ***************************
 *  Show Add Classification Form
 * ************************** */
invCont.showAddClassificationForm = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: req.flash("success") || null,
      errors: req.flash("error") || null,
      classification_name: req.flash("classification_name") || ""
    });
  } catch (error) {
    console.error("❌ Error loading classification form:", error);
    next(error);
  }
};

/* *****************************************
 *  Path to display the add inventory form
 * *************************************** */
invCont.showAddInventoryForm = async (req, res) => {
  try {
    const classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", { 
      title: "Add New Vehicle",
      classificationList,
      inv_make: '',
      inv_model: '',
      inv_description: '',
      inv_image: '',
      inv_thumbnail: '',
      inv_price: '',
      inv_year: '',
      inv_miles: '',
      inv_color: '',
      message: req.flash("message") || null,
    });
  } catch (error) {
    console.error("Error loading add inventory view:", error);
    res.status(500).send("Server Error");
  }
};

/* *****************************************
 *  Path to process the add inventory form
 * *************************************** */
invCont.processAddInventoryForm = async (req, res) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body;

  // Basic field validation
  if (!classification_id || !inv_make || !inv_model || !inv_description || !inv_price || !inv_year || !inv_miles || !inv_color) {
    try {
      const classificationList = await utilities.buildClassificationList(classification_id);
      return res.status(400).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        message: "All fields are required.",
        classificationList,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
      });
    } catch (error) {
      console.error("Error fetching classification list during form validation:", error);
      return res.status(500).send("Internal Server Error");
    }
  }

  try {
    const insertResult = await invModel.addInventoryItem({ classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color });
    if (insertResult.rowCount === 1) {
      req.flash("success", "Vehicle added successfully!");
      return res.redirect("/inv/management");
    } else {
      throw new Error("Insertion failed");
    }
  } catch (error) {
    console.error("Error adding inventory item:", error);
    try {
      const classificationList = await utilities.buildClassificationList(classification_id);
      res.status(500).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        classificationList,
        message: "There was an error adding the vehicle.",
      });
    } catch (err) {
      console.error("Error fetching classification list during insertion:", err);
      res.status(500).send("Internal Server Error");
    }
  }
};

/* ******************************************
 *  Build inventory by classification view
 * **************************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;

  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const nav = await utilities.getNav();

    if (!data || data.length === 0) {
      console.log(`No vehicles found for classification ID: ${classification_id}`);
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
    console.error("❌ Error in buildByClassificationId:", error);
    res.status(500).send("Internal Server Error");
    next(error);
  }
};

/* ***************************
 *  Show Inventory Management View
 * ************************** */
invCont.showManagementView = async function (req, res) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
    });
  } catch (error) {
    console.error("❌ Error rendering inventory management:", error);
    res.status(500).send("Internal Server Error");
  }
};

/* ***************************
 *  Show Add Classification Form
 * ************************** */
invCont.showAddClassificationForm = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: null,
      errors: null,
      classification_name: ""
    });
  } catch (error) {
    console.error("❌ Error loading classification form:", error);
    next(error);
  }
};

/* ***************************
 *  Process New Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body;

  if (!classification_name || classification_name.trim() === "") {
    req.flash("error", "Classification name cannot be empty.");
    return res.redirect("/inv/add-classification");
  }

  try {
    const result = await invModel.insertClassification(classification_name);

    if (result.rowCount > 0) {
      req.flash("success", "Classification added successfully!");
      return res.redirect("/inv/type/" + result.rows[0].classification_id);
    } else {
      req.flash("error", "Failed to add classification.");
      res.redirect("/inv/add-classification");
    }
  } catch (error) {
    console.error("❌ Error adding classification:", error);
    res.status(500).send("Internal Server Error");
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
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "The requested vehicle does not exist",
        nav,
      });
    }

    res.render("inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`,
      vehicle,
      nav,
    });
  } catch (error) {
    console.error("❌ Error in getVehicleDetail:", error);
    res.status(500).send("Internal Server Error");
    next(error);
  }
};

/* ***************************
 *  Export Controller
 * ************************** */
module.exports = invCont;
