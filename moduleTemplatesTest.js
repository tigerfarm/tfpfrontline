console.log( '+ Load module customers.');
const theTemplates = require('./modules/templates.js');
theCustomerId = 3;
console.log('+ GetTemplates for Customer Id: ' + theCustomerId);
const templatesList = theTemplates.templates(theCustomerId);
console.log( '++ Worker Templates: ' + JSON.stringify(templatesList));
console.log( '++ First Template result: ' + templatesList[0].templates[0].content);

