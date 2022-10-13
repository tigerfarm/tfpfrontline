// -----------------------------------------------------------------------------
// Notify notification testing web server
// + No Twilio requests made from this web server.
// 
// Easy to use.
// Install modules.
//  $ npm install --save express
//  
// 
// Run the web server. Default port is hardcoded to 8080.
//  $ node websever.js
// 
// -----------------------------------------------------------------------------
console.log("+++ Start Frontline CRM Application web server.");
console.log("+ Check the server a browser: http://example.com/");
//
// -----------------------------------------------------------------------------
// Web server interface to call functions.
// 
const express = require('express');
const path = require('path');
const url = require("url");

// When deploying to Heroku, must use the keyword, "PORT".
// This allows Heroku to override the value and use port 80. And when running locally can use other ports.
const PORT = process.env.PORT || 8080;

var app = express();

// -----------------------------------------------------------------------------
// Security: Twilio request validation.
const client = require('twilio');
const authToken = process.env.MAIN_AUTH_TOKEN; // Your account Twilio Auth Token

// Values used to send messages, the "From" value.
const smsNumber = process.env.FRONTLINE_SMS_NUMBER;
const whatsappNumber = "whatsapp:" + process.env.FRONTLINE_WHATSAPP_NUMBER;

// Load customer JSON data.
const customerJson = require('./customers.js');
const customers = customerJson.customers;

// -----------------------------------------------------------------------------
// Message templates
//
const OPENER_NEXT_STEPS = 'Hello {{Name}} we have now processed your documents and would like to move you on to the next step. Drop me a message. {{Author}}.';
const OPENER_NEW_PRODUCT = 'Hello {{Name}} we have a new product out which may be of interest to your business. Drop me a message. {{Author}}.';
const OPENER_ON_MY_WAY = 'Just to confirm I am on my way to your office. {{Name}}.';

const REPLY_SENT = 'This has now been sent. {{Author}}.';
const REPLY_RATES = 'Our rates for any loan are 20% or 30% over $30,000. You can read more at https://example.com. {{Author}}.';
const REPLY_OMW = 'Just to confirm I am on my way to your office. {{Author}}.';
const REPLY_OPTIONS = 'Would you like me to go over some options with you {{Name}}? {{Author}}.';
const REPLY_ASK_DOCUMENTS = 'We have a secure drop box for documents. Can you attach and upload them here: https://example.com. {{Author}}';

const CLOSING_ASK_REVIEW = 'Happy to help, {{Name}}. If you have a moment could you leave a review about our interaction at this link: https://example.com. {{Author}}.';

// -----------------------------------
// Twilio WhatsApp Sandbox templates
//
const SANDBOX_TEMPLATE_1 = 'Your {{CompanyName}} code is {{Code}}.';
//          Example: Your Twilio code is 1238432
//      Your appointment is coming up on {{1}} at {{2}}
//          Example: Your appointment is coming up on July 21 at 3PM
//      Your {{1}} order of {{2}} has shipped and should be delivered on {{3}}. Details: {{4}}
//          Example: Your Yummy Cupcakes Company order of 1 dozen frosted cupcakes has shipped and should be delivered on July 10, 2019. Details: http://cupcakes.example.com/
// -----------------------------------
// WhatsApp templates.
//
//  Note, customer JSON data is used to merge into the templates.
//      const customers = [
//      {
//              customer_id: 1,
//              display_name: 'Coleridge',
//              channels: [
//                  {type: 'sms', value: '+16505551111'}
//              ],
//              worker: 'lordbyron@example.com',
//              avatar: 'https://abouttime-2357.twil.io/Coleridge.jpg'
//          },
//
// -----------------------------------------------------------------------------
// Add parameters into message templates.
//
const compileTemplate = (template, customer) => {
    let compiledTemplate = template;
    //
    compiledTemplate = compiledTemplate.replace(/{{Name}}/, customer.display_name);
    compiledTemplate = compiledTemplate.replace(/{{Author}}/, customer.worker);
    //
    // Added for Sandbox templates:
    compiledTemplate = compiledTemplate.replace(/{{CompanyName}}/, customer.company_name);
    compiledTemplate = compiledTemplate.replace(/{{Code}}/, getRndInteger(100000, 999999)); // 6 digit random number.
    //
    return compiledTemplate;
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// -----------------------------------------------------------------------------
// Global request variables.
var theLocation = "";
var theWorker = "";
var theCustomerId = "";
var theConversationSid = "";
var theChannelName = "";
var validationUrl = "";
function parseValidateRequest(req, theData) {
    // -------------------------------------------------------------------------
    // Get the POST request body data into variables.
    // console.log("++ Request body data:" + theData + ":");
    theLocation = "";
    theWorker = "";
    theCustomerId = "";
    theChannelName = "";
    // :Location=GetCustomersList&Worker=dave%40example.com:
    // For validation:
    // params = {"Location":"GetCustomersList","Worker":"dave@example.com"};
    var validationParams = "{";
    // console.log("+ theData typeof: " + typeof theData);
    var thePairs = theData.toString().split("&");   // theData is an object. Convert to string.
    var theLength = thePairs.length;
    for (var i = 0; i < theLength; i++) {
        aPair = thePairs[i].split("=");
        theAttribute = aPair[0];
        theAttributeValue = decodeURIComponent(aPair[1]);
        validationParams = validationParams + '"' + theAttribute + '":"' + theAttributeValue + '"';
        if (i < theLength - 1) {
            validationParams = validationParams + ',';
        }
        switch (theAttribute) {
            case 'Location':
            {
                // All Frontline requests have a "Location" attribute value.
                theLocation = theAttributeValue;
                // console.log("++ theLocation: " + theLocation);
                break;
            }
            case 'Worker':
            {
                theWorker = theAttributeValue;
                // console.log("++ theWorker: " + theWorker);
                break;
            }
            case 'ConversationSid':
            {
                theConversationSid = theAttributeValue;
                // console.log("++ theConversationSid: " + theConversationSid);
                break;
            }
            case 'CustomerId':
            {
                theCustomerId = theAttributeValue;
                // console.log("++ theCustomerId: " + theCustomerId);
                break;
            }
            case 'channelName':
            {
                theChannelName = theAttributeValue;
                console.log("++ theChannelName: " + theChannelName);
                break;
            }
        }
    }
    // -------------------------------------------------------------------------
    // Compose the validation URL.
    validationUrl = 'https://' + req.header('host') + url.parse(req.url).pathname;
    //
    // Validate the request.
    var twilioSignature = req.header('x-twilio-signature');
    if (twilioSignature === "abde123456XDAcBvdg9LQOAvabc=") {
        // This can be a default signature to use when testing without the Frontline app.
        return(true);
    }
    validationParams = validationParams + "}";
    // var theHeaders = JSON.stringify(req.headers).split('","');
    // console.log("+ Headers, count = " + theHeaders.length + ":" + theHeaders);
    // console.log("+ Validate request with auth token: " + authToken);
    // console.log("++ Twilio validation signature header, x-twilio-signature: " + twilioSignature);
    // console.log("++ validationUrl: " + validationUrl);
    // console.log("++ validationParams: " + validationParams);
    var validRequest = client.validateRequest(authToken, twilioSignature, validationUrl, JSON.parse(validationParams));
    return(validRequest);
}

// -----------------------------------------------------------------------------
// Handle customer requests: customer list and single customer information.
//
app.post("/callbacks/crm", function (req, res) {
    console.log("----- POST request /callbacks/crm");
    // console.log("++ customers: " + JSON.stringify(customers));
    req.on('data', function (data) {
        if (!parseValidateRequest(req, data)) {
            console.log("-- Error: 401 Signature validation failed.");
            res.sendStatus(401);
            return;
        } else {
            console.log("++ Signature validation success.");
        }
        // ---------------------------------------------------------------------
        // Handle each type of request.
        //
        switch (theLocation) {
            case 'GetCustomerDetailsByCustomerId':
            {
                console.log("++ GetCustomerDetailsByCustomerId: " + theCustomerId);
                var customerDetails = customers.find(customer => String(customer.customer_id) === String(theCustomerId));
                res.send({
                    objects: {
                        customer: {
                            customer_id: customerDetails.customer_id,
                            display_name: customerDetails.display_name,
                            channels: customerDetails.channels,
                            links: customerDetails.links,
                            avatar: customerDetails.avatar,
                            details: customerDetails.details
                        }
                    }
                });
                console.log('++ Success, customerDetails.display_name: ' + customerDetails.display_name);
                return;
            }
            case 'GetCustomersList':
            {
                console.log("++ GetCustomersList, for worker: " + theWorker);
                // Get data into proper format, and respond with it.
                var workerCustomers = customers.filter(customer => customer.worker === theWorker);
                // console.log("++ workerCustomers: " + JSON.stringify(workerCustomers));
                var workerCustomersList = workerCustomers.map(customer => ({
                        display_name: customer.display_name,
                        customer_id: customer.customer_id,
                        avatar: customer.avatar
                    }));
                // console.log("++ Worker's Customers list: " + JSON.stringify(workerCustomersList));
                res.send({
                    objects: {
                        customers: workerCustomersList
                    }
                });
                console.log("++ Success, number of worker's customers: " + workerCustomers.length);
                return;
            }
            default:
            {
                console.log('-- Error: Unknown request type, Location: ', location);
                res.sendStatus(422);
                return;
            }
        }
    });
});

// -----------------------------------------------------------------------------
// Message templates for quick responses, or for WhatsApp template messages.
//
app.post("/callbacks/templates", function (req, res) {
    console.log("----- POST request /callbacks/templates");
    // ++ Request body data:Worker=tigerfarm%40gmail.com&CustomerId=33&Location=GetTemplatesByCustomerId&ConversationSid=CH8be60436237c418bb547efad223dbc3b:
    // ++ POST request URL: https://tfpfrontlinebase.herokuapp.com/callbacks/templates
    req.on('data', function (data) {
        if (!parseValidateRequest(req, data)) {
            console.log("-- Error: 401 Signature validation failed.");
            res.sendStatus(401);
            return;
        } else {
            console.log("++ Signature validation success.");
        }
        console.log("++ POST request URL: " + validationUrl);
        console.log("++ Request body data:" + data + ":");
        //
        // ---------------------------------------------------------------------
        // Handle the request.
        //
        if (theCustomerId === "") {
            console.log("-- Error: 401 CustomerId required.");
            return res.status(404).send("-- Error, customer id not found: " + theCustomerId);
        }
        //
        console.log("++ GetCustomerDetailsByCustomerId: " + theCustomerId);
        var customerDetails = customers.find(customer => String(customer.customer_id) === String(theCustomerId));
        if (!customerDetails) {
            return res.status(404).send("-- Error, customer id not found: " + theCustomerId);
        }
        // -----------------------------
        // Prepare templates categories
        // Pre-approved templates for out of session messages: ", whatsAppApproved: true"
        //
        const openersCategory = {
            display_name: 'Openers', // Category name
            templates: [
                {content: compileTemplate(OPENER_NEXT_STEPS, customerDetails)}, // Compiled template
                {content: compileTemplate(OPENER_NEW_PRODUCT, customerDetails)},
                {content: compileTemplate(OPENER_ON_MY_WAY, customerDetails), whatsAppApproved: true}, // Pre-approved WhatsApp template
                {content: compileTemplate(SANDBOX_TEMPLATE_1, customerDetails), whatsAppApproved: true}
            ]
        };
        const repliesCategory = {
            display_name: 'Replies',
            templates: [
                {content: compileTemplate(REPLY_SENT, customerDetails)},
                {content: compileTemplate(REPLY_RATES, customerDetails)},
                {content: compileTemplate(REPLY_OMW, customerDetails)},
                {content: compileTemplate(REPLY_OPTIONS, customerDetails)},
                {content: compileTemplate(REPLY_ASK_DOCUMENTS, customerDetails)}
            ]
        };
        const closingCategory = {
            display_name: 'Closing',
            templates: [
                {content: compileTemplate(CLOSING_ASK_REVIEW, customerDetails)}
            ]
        };
        // -------------------------------
        // Respond with compiled Templates
        res.send([openersCategory, repliesCategory, closingCategory]);
        console.log("++ Success.");
    });
});

// -----------------------------------------------------------------------------
app.post("/callbacks/outgoing-conversation", function (req, res) {
    console.log("----- POST request /callbacks/outgoing-conversation");
    req.on('data', function (data) {
        if (!parseValidateRequest(req, data)) {
            console.log("-- Error: 401 Signature validation failed.");
            res.sendStatus(401);
            return;
        } else {
            console.log("++ Signature validation success.");
        }
        console.log("++ POST request URL: " + validationUrl);
        console.log("++ Request body data:" + data + ":");
        //
        // ---------------------------------------------------------------------
        // Handle the request.
        //
        // In order to start a new conversation ConversationsApp need a proxy address
        // otherwise the app doesn't know from which number to send a message, to the customer
        var proxyAddress = "";
        if (theChannelName === "whatsapp") {
            proxyAddress = whatsappNumber;
        } else {
            proxyAddress = smsNumber;
        }
        if (proxyAddress !== "") {
            res.status(200).send({proxy_address: proxyAddress});
            console.log("++ Success, Frontline proxy address using a Twilio phone number: " + proxyAddress);
            return;
        }
        console.log("- Proxy address not found");
        res.sendStatus(403);
    });
});

// -----------------------------------------------------------------------------
// All other HTTP POST requests will be echoed.
//
app.post('*', function (req, res) {
    console.log("----- POST request.");
    req.on('data', function (data) {
        if (!parseValidateRequest(req, data)) {
            console.log("-- Error: 401 Signature validation failed.");
            res.sendStatus(401);
            return;
        } else {
            console.log("++ Signature validation success.");
        }
        console.log("++ POST request URL: " + validationUrl);
        console.log("++ Request body data:" + data + ":");
    });
    console.log('+ Frontline Integration Service Application requests not handled.');
    res.sendStatus(422);
});

// -----------------------------------------------------------------------------
app.get('/hello', function (req, res) {
    res.send('+ hello there.');
});
app.get('/', function (req, res) {
    res.send('+ Frontline Integration Service Application');
});
app.get('*', function (req, res) {
    res.send('+ Frontline Integration Service Application requests need to POST HTTP requests.');
});
// -----------------------------------------------------------------------------
app.listen(PORT, function () {
    console.log('+ Listening on port: ' + PORT);
});

// eof