/* ******************************************
 * Application Server
 * ******************************************/
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const path = require("path");
const baseController = require("./controllers/baseController");
const static = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities");
const db = require("./database/index");

/* ***********************
 * Serve static files
 *************************/
app.use(express.static("public"));

/* ***********************
 * Index Route
 *************************/
app.get("/", baseController.buildHome)

/* ***********************
 * Middleware for Parsing JSON & Forms
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ***********************
 * Routes
 *************************/
app.use(static);
app.use("/inv", inventoryRoute);

/* ******************************************
 * Default GET route
 * ***************************************** */
app.get("/", async (req, res) => {
  try {
    let nav = await utilities.getNav();
    res.render("index", { title: "Home", nav });
  } catch (error) {
    console.error("Error rendering home:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ******************************************
 * Database Connection Test
 * *****************************************/
db.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection error:', err));

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
// Test Error Route (for development/testing)
app.get("/trigger-error", async (req, res, next) => {
  try {
    // Simulate a server error
    throw new Error("This is a simulated 500 error for testing purposes");
  } catch (error) {
    next(error);
  }
});

// Error Handling Routes
app.get("/error-test", (req, res) => {
  res.status(500).render("errors/error", {
    title: "500 - Server Error",
    message: "This is a test error page",
    nav: utilities.getNav()
  });
});

/* ***********************
 * Error Handlers
 *************************/
// 404 Not Found Handler
app.use(async (req, res, next) => {
  const nav = await utilities.getNav();
  res.status(404).render("errors/error", {
    title: "404 - Page Not Found",
    message: "Sorry, we appear to have lost that page.",
    nav
  });
});

// Global Error Handler
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  const status = err.status || 500;
  
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  console.error(err.stack); // Log full stack trace for debugging

  let message = "Oh no! There was a crash. Maybe try a different route?";
  if (status === 404) {
    message = err.message;
  } else if (process.env.NODE_ENV === 'development') {
    message = err.message;
  }

  res.status(status).render("errors/error", {
    title: `${status} - ${status === 404 ? 'Not Found' : 'Server Error'}`,
    message,
    nav,
    // Only show error details in development
    error: process.env.NODE_ENV === 'development' ? err : null
  });
});


/* ******************************************
 * Server host name and port
 * *****************************************/
const PORT = process.env.PORT || 5500;
const HOST = process.env.HOST || 'localhost';

/* ***********************
 * Log statement to confirm server operation
 * *********************** */
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 Startup time: ${new Date().toLocaleString()}`);
});