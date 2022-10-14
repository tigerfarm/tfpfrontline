console.log( '+++ Start load module customers and test the methods.');
const customerData = require('./modules/customers.js');

console.log('----------------------------------------------------');
console.log('+ Get all customers in JSON format.');
console.log( '++ List customers: ' + JSON.stringify(customerData.allCustomers));

console.log('----------------------------------------------------');
theWorker = "dave@example.com";
console.log('+ Get customers are a specific worker: ' + theWorker);
workerCustomersList = customerData.workerCustomers(theWorker);
console.log('++ Number of customers assigned to the Worker: ' + workerCustomersList.length);
console.log('++ List customers for the Worker: ' + JSON.stringify(workerCustomersList));

console.log('----------------------------------------------------');
theCustomerId = "2";
console.log('+ Get customers details: ' + theCustomerId);
customerDetails = customerData.customerDetails(theCustomerId);
console.log("++ Customer's display_name: " + customerDetails.customer.display_name);
console.log('++ List customer details: ' + JSON.stringify(customerDetails));

console.log( '+++ Exit.');
