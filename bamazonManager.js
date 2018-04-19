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
var valid;

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
		choices: ["View Products for Sale", "View Low Inventory", "Change Stock", "Add New Product", "QUIT"]
	}).then(function (answers) {
		// then route the 
		switch (answers.command) {
			case "View Products for Sale":
				{ survey(); }
				break;
			case "View Low Inventory":
				{ surveyLow() }
				break;
			case "Change Stock":
				{ addQTY(); }
				break;
			case "Add New Product":
				{
					addNewProduct();
				}
				break;
			case "QUIT":
				{ quitStart(); }
				break;
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
	// start over
	startManager();
};

// function to add to MYSQL
function addNewProduct() {
	console.log("What item would you like to add?");
	inquirer.prompt([
		// question 1
		{
			message: "Item Name",
			name: "PRODUCT_NAME",
			type: "input",
			validate: function (response) {
				valid = false;
				validateString(response);
				return valid;
			}
		},

		{
			message: "What is the department for this item?",
			name: "DEPARTMENT_NAME",
			type: "input",
			validate: function (response) {
				valid = false;
				validateString(response);
				return valid;
			}
		},

		// question 3
		{
			message: "What is the cost to the customer?",
			name: "PRICE_CUSTOMER",
			type: "input",
			validate: function (response) {
				valid = false;
				validateNumber(response);
				return valid;
			}
		},
		{
			message: "What is the cost to Bamazon?",
			name: "PRICE_TO_BAMAZON",
			type: "input",
			validate: function (response) {
				valid = false;
				validateNumber(response);
				return valid;
			}
		},
		// question 2
		{
			message: "How many would you like to add?",
			name: "STOCK_QTY",
			type: "input",
			validate: function (response) {
				valid = false;
				validateNumber(response);
				return valid;
			}
		},

	]).then(function (itemQs) {
		// build a query URL that will be used to update the database?
		var queryURL = "INSERT INTO BAMAZON_PRODUCTS SET ?"
				// connect to the database, use the queryURL and pass in the JSON object from the itemQs information
		connection.query(queryURL, itemQs, function (err, result) {
			if (err) {
				return console.log(err)
			}
			// some nice context
			console.log("ADDED " + itemQs.PRODUCT_NAME + " TO THE DATABASE");
		})
		startManager();

	})
};

function addQTY(){
inquirer.prompt([{
	message: "What item would you like to alter the stock of?",
	name: "PRODUCT_NAME",
	type: "list",
	choices: function () {
	  returnItems = [];
		for (var i = 0; i < dbArray.length; i++) {
			returnItems.push(dbArray[i].product_name);
		}
		return returnItems;
	}
},
	{
	message: "What would you like to set the new quantity to?",
	name: "STOCK_QTY",
	type: "input",
	validate: function (input){
		valid = false;
		validateNumber(input);
		return valid;
	}}
]).then( function(updateQ){
	var queryURL = "UPDATE BAMAZON_PRODUCTS SET ? WHERE ? ";
connection.query(queryURL, updateQ
, function (results, error){
	if (error){
		return console.log("ERROR: " + error)
	}
	console.log("WE UPDATED THE QTY OF " + updateQ.PRODUCT_NAME + " TO " + updateQ.STOCK_QTY)
startManager();
})
})};

function quitStart(){
	 inquirer.prompt({
		 message: "Are you ready to Quit?",
		 name: "quitConfirm",
		 type: "confirm",
		 default: "Y"
	 }).then( function (quitAnswer){
		 if (quitAnswer.quitConfirm)

			{console.log("Thanks and have a great shift!")
				return  connection.end()
			}
			startManager();
	 })
}

function validateNumber(response) {
	valid = false;
	Joi.validate(response, Joi.number().min(1).required(), function (validateError, val) {
		if (validateError) {
			console.log(validateError.message);
			valid = validateError.message;
		}
		else {
			valid = true;
		}
	})
};

function validateString(response) {
	Joi.validate(response, Joi.string().required(), function (validateError, val) {
		if (validateError) {
			console.log(validateError.message);
			valid = validateError.message;
		}
		else {
			valid = true;
		}
	})
};