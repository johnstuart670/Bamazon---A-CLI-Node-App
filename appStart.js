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
			type: "rawlist",
			choices: function () {
				// empty our arrays and placeholders
				choiceArray = [];
				dbArray = [];
				chosenItem = "";
				// populate the choice array with the results from our query using Item Name, then use that as our selection list for inquirer
				for (var i = 0; i < results.length; i++) {
					dbArray.push(results[i]);
					choiceArray.push(results[i].product_name);
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
						message: "How many " + chosenItem.product_name + " would you like to buy at $ " +chosenItem.PRICE_CUSTOMER +"?  \n You can purchase up to " + chosenItem.STOCK_QTY,
						name: "purchaseQTY",
						type: "input",
						validate: function (purchaseQTY) {
							// use the Joi APY to validate that the input is a number, more than 1 and no less than the stock qty
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
				).then(function(answer){
					// we then push the shopping cart with the item and the purchase qty and update the cartPrice tool
					cartPrice += (chosenItem.PRICE_CUSTOMER*answer.purchaseQTY);
					shoppingCart.push({
						product_name: chosenItem.product_name,
						purchaseQTY: answer.purchaseQTY,
						price_customer: chosenItem.PRICE_CUSTOMER,
						cartPrice: parseFloat(this.purchaseQTY*this.price_customer)
					});
					// and inquire if the user is done shopping.
					shoppingCartConfirm();
				})

				connection.end()
			})
	})
};

start();

// function that checks if the user is ready to checkout
function shoppingCartConfirm(){
	inquirer.prompt(
		{
			message: "Are you ready to checkout?",
			type: "confirm",
			default: "N",
			name: "confirm"
		}
	)
	.then(function(shoppingQ){
		// if user is ready, then run the checkout function
if (shoppingQ.confirm){
	return	checkoutFunction();
}
// otherwise start confirm what they want to do next
nextAction();
		})
	};

	function checkoutFunction(){
	// loop through the items in the shoppingCart array and log out the 
	console.log("ALL ITEMS IN SHOPPING CART");
	console.log("-----------------------------")
	for (var i = 0; i < shoppingCart.length; i++){
		shoppingCart[i] = sC
		console.log("ITEM " + i + " IN CART: " + sC.product_name);
		console.log("QTY: " + sC.purchaseQTY + " @ " + sC.price_customer + " = $" + sC.cartPrice );
		console.log("-----------------------------");
	}
	console.log("TOTAL PRICE OF CART : $" + parseFloat(cartPrice));
verifyCheckout();
}
// checkout function
function verifyCheckout(){
	inquirer.prompt({
		name: "verify",
		message: "ARE YOU READY TO CHECKOUT?",
		type: "confirm",
		default: "Y"
	})
	.then(function(checkoutAnswer){
		if (checkoutAnswer){
			console.log("$" + cartPrice + " ORDER CONFIRMED WITH " + shoppingCart.length + "ITEMS");
			console.log("THANK YOU FOR YOUR BUSINESS, SESSION TERMINATED");
			return connection.end();
		}

	})
}

cancelItem
	// then we will run a new inquirer prompt off the answer, using data from the first inquirer prompt and data validation from joi
// 	}.then(inquirer.prompt(answers, 
// function that removes the item from the array at the index point requested.
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function nextAction();

// 		connection.query("SELECT * FROM bamazon_products WHERE ? like ?", function (error, results){
// 		[{product_name: answer.item}],
// 		function (error){
// 			return (console.log("There was an error with your choice: " + error))
// 		};
// return productChoice;
// 	}

// that takes the answers and then plugs them into the json object

// first ask if they are a manager or customer

// then provide list of options for customer or manager based on if statements

// app user  selects action and then selects an object from the db (placeholder array?)

// that then updates the mySQL stuff based on action taken and item selected and calls the original function so it is recursive
