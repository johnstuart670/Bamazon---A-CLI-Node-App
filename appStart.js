// import the node packages
var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // We can add in authentication if this works correctly
  user: "root",

	// there is no password for now but it could be pretty easily added?
  password: "",
  database: "bamazon_DB"
});


// do an inquirer prompt set


// that takes the answers and then plugs them into the json object

// first ask if they are a manager or customer

// then provide list of options for customer or manager based on if statements

// app user  selects action and then selects an object from the db (placeholder array?)

// that then updates the mySQL stuff based on action taken and item selected and calls the original function so it is recursive!


