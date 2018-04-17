module.exports.startManager = startManager;

var inquirer = require("inquirer");
var Joi = require("joi");
var mysql = require("mysql");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	// We can add in authentication if this works correctly
	user: "root",

	// there is no password for now but it could be pretty easily added?
	password: "",
	database: "bamazon_DB"
});

var dbArray = [];
var chosenItem = "";
var actionCart = [];

function startManager() {
	console.log("What would you like to do?")
	// add items to our dbArray fron the bamazon_products table
	connection.query("SELECT * FROM bamazon_products", function (err, results) {
		// if there's an error stop, log the error
		if (err) {
			return console.log(err)
		}
		// empty the dbArray
		dbArray = [];
		for (var i = 0; i < results.length; i++) {
			// refresh the dbArray
			dbArray.push(results[i]);
		}
	});
	inquirer.prompt({
		message: "What would you like to do?",
		name: "command",
		type: "list",
		choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Modify Task", "Complete Manager Transaction(s)"]
	}).then(function (answers) {
		// then route the 
		switch (answers.command) {
			case "View Products for Sale":
				{ survey(); }
				break;
			case "View Low Inventory":
				{ surveyLow() }
				break;
			case "Add to Inventory":
				{ addQTY(); }
				break;
			case "Add New Product":
				{ addNewProduct(); }
				break;
			case "Complete Manager Transaction(s)":
				{ startCheckout() }
				break;
			case "Modify Task":
				{ modifyTask(); }
			default: console.log("How did you get here?")
		}
	})
}

function survey() {
	console.log("THESE ARE ALL THE ITEMS IN INVENTORY NOW!");
	console.log("~*------------------------------*~")
	for (var i = 0; i < dbArray.length; i++) {
		// placeholder variable because I hate typing
		var dB = dbArray[i];
		console.log("ITEM " + (dB.item_id) + " " + dB.product_name);
		console.log("QTY IN STOCK: " + dB.STOCK_QTY);
		console.log("Price to Customer: " + dB.PRICE_CUSTOMER + " Bamazon Cost: " + dB.PRICE_TO_BAMAZON)
		console.log("-----------------------------");
	}
	startManager();
};

function surveyLow() {
	console.log("THESE ARE ALL THE ITEMS IN INVENTORY WITH LESS THAN 5 IN STOCK!");
	console.log("~*------------------------------*~")
	for (var i = 0; i < dbArray.length; i++) {
		// placeholder variable because I hate typing
		var dB = dbArray[i];
		if (dB.STOCK_QTY < 5) {
			console.log("ITEM " + (dB.item_id) + " " + dB.product_name);
			console.log("QTY IN STOCK: " + dB.STOCK_QTY);
			console.log("Price to Customer: " + dB.PRICE_CUSTOMER + " Bamazon Cost: " + dB.PRICE_TO_BAMAZON)
			console.log("-----------------------------");
		}
	}
	startManager();
};

function addNewProduct(){
	console.log("What item would you like to add?");
	inquirer.prompt([
		{
			message: "Item Name",
			name: "itemName",
			type: "input",
			validate: function(){
				var valid;
							Joi.validate(purchaseQTY, Joi.string().required(), function (validateError, val) {
								if (validateError) {
									console.log(validateError.message);
									valid = validateError.message;
								}
								else {
									valid = true;
								}
							})
							return valid;
			}},
			{
			message: "How many would you like to add?",
			name: "itemQTY",
			type: "input",
			validate: function(){
				var valid;
							Joi.validate(purchaseQTY, Joi.number().min(1).required(), function (validateError, val) {
								if (validateError) {
									console.log(validateError.message);
									valid = validateError.message;
								}
								else {
									valid = true;
								}
							})
							return valid;
			}
			}
	])
}
