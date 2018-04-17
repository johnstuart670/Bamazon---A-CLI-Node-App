// import the node packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var Joi = require("joi");
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

// mySql connection so we can use the database we are referencing.
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	// We can add in authentication if this works correctly
	user: "root",

	// there is no password for now but it could be pretty easily added?
	password: "",
	database: "bamazon_DB"
});
// this boots up the functions at the start of the node app
console.log("WELCOME TO THE BAMAZON STORE!");
start();


// do an inquirer prompt set that is our start function
function start() {

	// connect to our SQL database to select all the items currently in the database
	connection.query("SELECT * FROM bamazon_products", function (err, results) {
		// if there's an error stop, log the error
		if (err) {
			return console.log(err)
		}
		// ask some questions to get input
		inquirer.prompt({
			message: "What item would you like to purchase?",
			name: "item",
			type: "list",
			choices: function () {
				// empty our arrays and placeholders
				choiceArray = [];
				dbArray = [];
				chosenItem = "";
				// populate the choice array with the results from our query using Item Name, then use that as our selection list for inquirer
				for (var i = 0; i < results.length; i++) {
					// select only items that are in stock and not in the cart already
					if (results[i].STOCK_QTY > 0) {
						dbArray.push(results[i]);
						choiceArray.push(results[i].product_name);
					}
				}
				return choiceArray;
			}
		})
			// when we have our answer we will then use it to populate data from our array
			.then(function (answer) {
				// loop through our dbArray and compare the product_name and set to the chosenItem variable when they match
				for (var i = 0; i < dbArray.length; i++) {
					if (dbArray[i].product_name === answer.item) {
						chosenItem = dbArray[i];
					}
				}
				// Prompt the user for how many items they want to buy and tell the max qty
				inquirer.prompt(
					{
						message: "How many " + chosenItem.product_name + " would you like to buy at $ " + chosenItem.PRICE_CUSTOMER + "?  \n You can purchase up to " + chosenItem.STOCK_QTY,
						name: "purchaseQTY",
						type: "input",
						validate: function (purchaseQTY) {
							// use the Joi APY to validate that the input is a number, more than 1 but no more than the stock qty.  var valid allows us to use inquirer for data validation
							var valid;
							Joi.validate(purchaseQTY, Joi.number().required().min(1).max(parseInt(chosenItem.STOCK_QTY)), function (validateError, val) {
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
				).then(function (answer) {
					// we then push the shopping cart with the item and the purchase qty and update the cartPrice 
					cartPrice += (chosenItem.PRICE_CUSTOMER * answer.purchaseQTY);
					shoppingCart.push({
						product_name: chosenItem.product_name,
						purchaseQTY: parseInt(answer.purchaseQTY),
						price_customer: parseFloat(chosenItem.PRICE_CUSTOMER),
						maxQTY: parseInt(chosenItem.STOCK_QTY),
						item_id: chosenItem.item_id
					});
					// and inquire what the user wants to do next.
					nextAction();
				})
			})
	})
};
// evaluate what the user wants to do next
function nextAction() {
	inquirer.prompt({
		message: "What would you like to do next?",
		type: "list",
		name: "nextAction",
		choices: ["Add More Items", "Remove Items", "Alter Item Order Amount", "Survey Cart", "Checkout"]
	})
		.then(function (actionAnswer) {
			switch (actionAnswer.nextAction) {
				case "Add More Items":
					// go to the start function
					start();
					break;
				case "Remove Items":
					// go to the removal function
					removeItem();
					break;
				case "Checkout":
					// go to the checkout tree;
					verifyCheckout();
					break;
				case "Alter Item Order Amount":
				// go to the function that alters the shopping cart qty
					alterItem();
					break;
				case "Survey Cart":
				// look at the cart
					checkoutFunction();
					break;
				default: console.log("how did you get here?")
			}
		})
};

// function that allows us to check all the items in the cart
function printCart() {
	console.log("ALL ITEMS IN SHOPPING CART");
	console.log("-----------------------------")
	// loops through the shoppingCart array
	for (var i = 0; i < shoppingCart.length; i++) {
		// placeholder variable because I hate typing
		var sC = shoppingCart[i];
		var sCPrice = sC.purchaseQTY * sC.price_customer
		console.log("ITEM " + (i + 1) + " IN CART: " + sC.product_name);
		console.log("QTY: " + sC.purchaseQTY + " @ " + sC.price_customer + " = $" + sCPrice);
		console.log("-----------------------------");
	}
	console.log("TOTAL PRICE OF CART : $" + parseFloat(cartPrice));
}

function checkoutFunction() {
// print out the items from the cart and prompt if the user is ready to checkout
	printCart();
	verifyCheckout();
}
// checkout function
function verifyCheckout() {
	// if the shopping cart is greater than zero then confirm if the user is ready to checkout
	if (shoppingCart.length > 0) {
		inquirer.prompt({
			name: "verify",
			message: "ARE YOU READY TO CHECKOUT?",
			type: "confirm",
			default: "Y"
		})
			.then(function (checkoutAnswer) {
						// if the user confirms yes
				if (checkoutAnswer.verify) {
					console.log("$" + cartPrice + " ORDER CONFIRMED WITH " + shoppingCart.length + " ITEMS");
					// loop through shopping cart items and update the item quantities in mySQL database
					for (var i = 0; i < shoppingCart.length; i++) {
						updateSQL(shoppingCart[i]);
					};
					// print out the items in the cart
					printCart();
					// thank them for their business
					console.log("THANK YOU FOR YOUR BUSINESS! NEW ORDER STARTED");
					// clear the arrays
					initializeValues();
					// start a new order
					return nextAction();
				}
			})
			// if there is nothing in the cart then redirect the user
	} else {
		console.log("Your shopping cart is empty, you can't check out at this time.");
		nextAction();
	}
}
// function that allows user to remove items from the array if there are items listed in it
function removeItem() {
	// if there are any items in the shoppingCart Array
	if (shoppingCart.length > 0) {
		// prompt to figure out what item they want to remove 
		inquirer.prompt({
			message: "Which Item would you like to remove?",
			name: "removeItem",
			type: "list",
			// the choices are from the current shopping list
			choices: function () {
				var returnItems = [];
				for (var i = 0; i < shoppingCart.length; i++) {
					returnItems.push(shoppingCart[i].product_name);
				}
				return returnItems;
			}
		})
			.then(function (removeQ) {
				// loop through the shopping cart to compare the .product name against the selection for the remove item, then use the hoisted function to remove the item at the iteration
				for (var i = 0; i < shoppingCart.length; i++) {
					var sC = shoppingCart[i];
					if (sC.product_name === removeQ.removeItem) {
						// subtract the cost of the items from the cartPrice
						cartPrice -= (sC.purchaseQTY * sC.price_customer);
						shoppingCart.remove(i);
						console.log("Removed " + sC.purchaseQTY + " " + sC.product_name + " From the Cart.")
					}
				}
				// get more input from the user
				nextAction();
			})
	}
	// if there are no items in shoppingCart, redirect the user
	else {
		console.log("We can't remove items since your cart is empty");
		nextAction();
	}
}

// function that removes the item from the array at the index point requested.
Array.prototype.remove = function (from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

function alterItem() {
	// if there are any items in the shoppingCart Array
	if (shoppingCart.length > 0) {
		// prompt to figure out what item they want to remove 
		inquirer.prompt([{
			message: "Which Item would you like to alter the quantity of?",
			name: "alterItem",
			type: "list",
			// the choices are from the current shopping cart
			choices: function () {
				var returnItems = [];
				for (var i = 0; i < shoppingCart.length; i++) {
					returnItems.push(shoppingCart[i].product_name);
				}
				return returnItems;
			}
		},
		{
			message: "How many would you like to order instead?",
			name: "newQTY",
			type: "input",
			validate: function (purchaseQTY) {
				// use the Joi APY to validate that the input is a number and more than 1 
				var valid;
				Joi.validate(purchaseQTY, Joi.number().required().min(1), function (validateError, val) {
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
			.then(function (alterQ) {
				// loop through the shopping cart array until you find a product_name match for the alterQ data
				for (var i = 0; i < shoppingCart.length; i++) {
					var sC = shoppingCart[i];
					if (sC.product_name === alterQ.alterItem) {
						// if they are trying to order more than the existing stock, then redirect the user
						if (sC.maxQTY < alterQ.newQTY) {
							console.log("You are trying to order more items than are available.  \nYou tried to order " + alterQ.newQTY + " and there are only " + sC.maxQTY + " " + sC.product_name + " available.  Process terminated.")
							return nextAction();
						}
						// update the purchaseQTY property at the object at the iteration
						sC.purchaseQTY = alterQ.newQTY;
						// subtract the price of the difference from the cartPrice
						cartPrice -= (sC.purchaseQTY * sC.price_customer);
					}
				}
				// get more input from the user
				nextAction();
			})
	}
	// if there are no items in shoppingCart, redirect the user
	else {
		console.log("We can't alter items in your cart because your cart is empty");
		nextAction();
	}
};

// function to updateSQL with a passed value
function updateSQL(item) {
	// build a query url for MYSQL by concatonating the delta of max qty and purchaseqty and the passed variable's property of property_id
	var queryURL = "UPDATE bamazon_products SET STOCK_QTY =  " + (item.maxQTY - item.purchaseQTY) + " WHERE item_id = " + item.item_id;
	// run the query through the connection
	connection.query(queryURL, function (error, results) {
		if (error) {
			return console.log('error!!')
			console.log(results)
		}
	})
};