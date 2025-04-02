const invCont = require("../controllers/invController");
const invModel = require("../models/inventory-model");
const getImageName = (path) => path.split('/').pop();
const utilities = require("../utilities/");


/*********************************************************
 * Build an HTML dropdown list of vehicle classifications
 ******************************************************* */
utilities.buildClassificationList = async (selectedId = null) => {
  const data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}" ${selectedId == row.classification_id ? "selected" : ""}>${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
};

/****************************************************
 * Middleware for handling errors in async functions
 *************************************************** */
utilities.handleErrors = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/******************************************
 * Builds the vehicle detail HTML structure
 *****************************************/
utilities.buildVehicleDetailHTML = function (vehicle) {
  const imageName = getImageName(vehicle.inv_image);
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(vehicle.inv_price);

  const miles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles);

  return `
    <div class="vehicle-detail">
        <img src="/images/vehicles/${imageName}" 
             alt="${vehicle.inv_make} ${vehicle.inv_model}">
    <div class="vehicle-detail">
      <img src="/images/vehicles/${vehicle.inv_image}" 
           alt="${vehicle.inv_make} ${vehicle.inv_model}" 
           class="vehicle-image">
      <div class="vehicle-info">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <div class="vehicle-specs">
          <p><span class="label">Price:</span> <span class="price">${price}</span></p>
          <p><span class="label">Miles:</span> <span class="miles">${miles}</span></p>
          <p><span class="label">Color:</span> ${vehicle.inv_color}</p>
        </div>
        <div class="vehicle-description">
          ${vehicle.inv_description}
        </div>
      </div>
    </div>
  `;
};

/************************************************
 * Constructs the navigation HTML unordered list
 **********************************************/
utilities.getNav = async function () {
  try {
    const { rows } = await invModel.getClassifications();
    
    if (!rows || rows.length === 0) {
      console.warn("No classifications found in database");
      return `
        <ul class="nav-list">
          <li class="nav-item">
            <a href="/" title="Home page" class="nav-link">Home</a>
          </li>
        </ul>`;
    }

    let navHTML = `
      <ul class="nav-list">
        <li class="nav-item">
          <a href="/" title="Home page" class="nav-link">Home</a>
        </li>`;

    rows.forEach((row) => {
      navHTML += `
        <li class="nav-item">
          <a href="/inv/type/${row.classification_id}" 
             title="Browse our ${row.classification_name} vehicles"
             class="nav-link">
            ${row.classification_name}
          </a>
        </li>`;
    });

    navHTML += `</ul>`;
    return navHTML;
  } catch (error) {
    console.error("Navigation system error:", error);
    return `
      <ul class="nav-list error">
        <li class="nav-item">
          <a href="/" title="Home page" class="nav-link">Home</a>
        </li>
        <li class="nav-item error">
          Navigation temporarily unavailable
        </li>
      </ul>`;
  }
};

/*************************************
 * Builds the classification grid HTML
 *************************************/
utilities.buildClassificationGrid = function (data) {
  const vehicles = Array.isArray(data) ? data : (data.rows || []);
  
  if (vehicles.length > 0) {
    let grid = '<ul id="inv-display">';
    
    vehicles.forEach((vehicle) => {
      grid += `
        <li>
          <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
          </a>
          <div class="namePrice">
            <hr />
            <h2>
              <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <span>${vehicle.inv_price.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</span>
          </div>
        </li>`;
    });
    
    grid += '</ul>';
    return grid;
  } else {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
};

module.exports = utilities;
