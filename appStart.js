// import the node packages
var inquirer = require("inquirer");
var Joi = require("joi");
// import our bamazon item
var customer = require("./bamazonCustomer");
var manager = require("./bamazonManager");

// choiceArray which is globally scoped so we can reference later
var choiceArray = [];
var dbArray = [];
var shoppingCart = [];
var chosenItem = "";
var cartPrice = 0;

function initializeValues() {
	choiceArray = [];
	dbArray = [];
	shoppingCart = [];
	chosenItem = "";
	cartPrice = 0;
}

appStart();
function appStart(){
	inquirer.prompt({
		message: "Welcome to the Bamazon Interface.  Please select Login",
		name: "userChoice",
		type: "list",
		choices: ["Customer", "Manager"]
	})
	.then (function(answers){
		switch (answers.userChoice){
			case "Customer":
			{customer.startCustomer()}
			break;
			case "Manager":
			{manager.startManager()}
			break;
			default: console.log("How did you get here?")
		}
	})
}
