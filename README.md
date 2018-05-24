# Bamazon_Node_App

##Bamazon 
Bamazon is a Node CLI App utilizing the following:
1. Inquirer.jsNode library for user input and navigation
2. Joi.js Node library for user input validation 
3. mySQL Node Module for data storage and modification



##Concept:
1. User will be able to choose Manager or Customer access
2. User will have different set of commands available based on which access they choose
	A. Manager:
		i. Survey all products in database by name
		ii. Survey all products in database by name with quantity less than 5
		iii. Manually update Inventory Levels
		iv. Add new items to database
	B. Customer
		i. Shop for new items by name and checkout with a shopping cart
			a. Customer is unable to order more than what is in stock
		ii. Alter order quantities
		iii. Remove items from shopping cart
		iv. Check the contents of their cart

## Challenges Faced
1. I really enjoyed the extra features that I built into this project, but I needed to focus on the MVP more.
2. Writing the CLI app would be easier with a testing framework
3. Not styling a front end app was a nice break but I would like to create a full-stack app of this as a demo ecomm website.
4. A more complex database would be interesting to see in production.
5. Using sql injection protection was easier when I wasn't overthinking it.
6. Documenting my thought processes and challenges in markdown is harder than I thought - I miss dynamic lists available in Word/Email/etc.

###Instructions to run Bamazon:
Please view the run video below on instructions and demonstrations of functionality:

[Please download the example video here](Bamazon_example.mov)