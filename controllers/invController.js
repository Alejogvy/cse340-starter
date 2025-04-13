const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const inventoryModel = require("../models/inventory-model");
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
 *  Show Add Inventory Form
 * *************************************** */
invCont.showAddInventoryForm = async (req, res) => {
  try {
    const classificationList = await utilities.buildClassificationList();
    const nav = await utilities.getNav();
    res.render("inventory/add-inventory", { 
      title: "Add New Vehicle",
      classificationList,
      nav,
      inv_make: '',
      inv_model: '',
      inv_description: '',
      inv_image: '',
      inv_thumbnail: '',
      inv_price: '',
      inv_year: '',
      inv_miles: '',
      inv_color: '',
      message: req.flash("message") || null
    });
  } catch (error) {
    console.error("Error loading add inventory view:", error);
    res.status(500).send("Server Error");
  }
};

/* *****************************************
 *  Process Add Inventory Form
 * *************************************** */
invCont.processAddInventoryForm = async (req, res) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body;

  if (!classification_id || !inv_make || !inv_model || !inv_description || !inv_price || !inv_year || !inv_miles || !inv_color) {
    try {
      const classificationList = await utilities.buildClassificationList(classification_id);
      const nav = await utilities.getNav();
      return res.status(400).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        message: "All fields are required.",
        classificationList,
        nav,
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
      const nav = await utilities.getNav();
      res.status(500).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        classificationList,
        nav,
        message: "There was an error adding the vehicle."
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
      inventory: data,
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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      error: null
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
      message: req.flash("success") || null,
      errors: req.flash("error") || null,
      classification_name: req.flash("classification_name") || ""
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

/* *****************************************
 *  Get Vehicle Details
 * ***************************************** */
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

/* ********************************************
 *  Return Inventory by Classification As JSON
 * ****************************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData && invData.length > 0) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
};

/* ********************************************
 *  Return Inventory by Classification As JSON
 * ******************************************* */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await inventoryModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
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
    classification_id,
  } = req.body
  console.log("➡️ Datos recibidos:", req.body);
  const updateResult = await invModel.updateInventory(
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
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
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
      classification_id
    })
  }
};

/* ***************************
 * Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await inventoryModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
};

/* ***************************
 * Delete Inventory Item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await inventoryModel.deleteInventoryItem(inv_id)

  if (deleteResult.rowCount) {
    req.flash("notice", "The inventory item was successfully deleted.")
    res.redirect("/inv")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect("/inv/delete/" + inv_id)
  }
};

/* ***************************
 *  Export Controller
 * ************************** */
module.exports = invCont;
