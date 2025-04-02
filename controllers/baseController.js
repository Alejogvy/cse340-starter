const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function(req, res) {
  try {
    const nav = await utilities.getNav();
    
    const messages = req.flash('info') || [];
    
    res.render("index", {
      title: "Home",
      nav,
      messages
    });
  } catch (error) {
    console.error("Error while rendering home page:", error);
    res.status(500).send("Error loading the home page.");
  }
};

module.exports = baseController;
