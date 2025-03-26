/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const baseController = require("./controllers/baseController");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config(); // Ya se ejecuta aquí
const app = express();
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");

/* ***********************
 * Routes
 *************************/
app.use(static);
app.use("/inv", inventoryRoute);

/* ***********************
 * Index route
 *************************/
app.get("/", baseController.buildHome);

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000; // Usar 3000 si no está definido
const host = process.env.HOST || "0.0.0.0"; // Render necesita "0.0.0.0"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
});
