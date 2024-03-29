// -----------------------------------------------------------------------------
// Notify notification testing web server
// + No Twilio requests made from this web server.
// 
// Easy to use.
// Install modules.
//  $ npm install --save express
// 
// Run the web server. Default port is hardcoded to 8080.
//  $ node websever.js
// 
// -----------------------------------------------------------------------------
console.log("+++ Start Frontline Integration Service Application web server, integration to CRM data.");
console.log("+ From a browser, can check that the server is running.");
//
// -----------------------------------------------------------------------------
// Web server interface to call functions.
// 
const express = require('express');
const path = require('path');
const url = require("url");

var app = express();

// -----------------------------------------------------------------------------
// Get environment variables.

// Security: Twilio request validation.
const client = require('twilio');
const authToken = process.env.MAIN_AUTH_TOKEN; // Your account Twilio Auth Token

// A signature string that can be used when testing.
// + Suggest removing it when used in a production environment.
const testTwilioSignature = process.env.FRONTLINE_TWILIO_SIGNATURE;

// Sender "From" values used to send conversation messages to SMS or WhatsApp users.
const smsNumber = process.env.FRONTLINE_SMS_NUMBER;
const whatsappNumber = "whatsapp:" + process.env.FRONTLINE_WHATSAPP_NUMBER;

// When deploying to Heroku, must use the keyword, "PORT".
// This allows Heroku to override the value and use port 80. And when running locally can use other ports.
const PORT = process.env.PORT || 8080;

// -----------------------------------------------------------------------------
// Load and set modules

// Load customer data.
const customerData = require('./modules/customers');
const customers = customerData.customers;

// Load templates.
var theTemplates = require('./modules/templates');

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
    // Confirm the request is valid by using Twilio signature validation.
    // Twilio cryptographically signs its requests.
    //  Documentation: https://www.twilio.com/docs/usage/security#validating-requests
    // 
    // Compose the validation URL.
    validationUrl = 'https://' + req.header('host') + url.parse(req.url).pathname;
    //
    // Validate the request.
    var twilioSignature = req.header('x-twilio-signature');
    if (twilioSignature === testTwilioSignature) {
        // This can be a default signature to use when testing without the Frontline app.
        return(true);
    }
    validationParams = validationParams + "}";
    // var theHeaders = JSON.stringify(req.headers).split('","');
    // console.log("+ Headers, count = " + theHeaders.length + ":" + theHeaders);
    // console.log("++ Validate request with auth token: " + authToken);
    // console.log("++ Twilio validation signature header, x-twilio-signature: " + twilioSignature);
    // console.log("++ validationUrl: " + validationUrl);
    // console.log("++ validationParams: " + validationParams);
    var validRequest = client.validateRequest(authToken, twilioSignature, validationUrl, JSON.parse(validationParams));
    return(validRequest);
}

// -----------------------------------------------------------------------------
// Handle client app requests:
//  + Worker's Customer list
//  + A customer details
//  + Worker's message templates
//  + SMS Twilio phone number or Twilio WhatsApp senderid
//
app.post("/frontline", function (req, res) {
    console.log("----- POST request /frontline");
    // console.log("++ customers: " + JSON.stringify(customers));
    req.on('data', function (data) {
        if (!parseValidateRequest(req, data)) {
            console.log("-- Error: 401 Signature validation failed.");
            res.sendStatus(401);
            return;
        } else {
            console.log("++ Signature validation success.");
        }
        console.log("++ POST request URL: " + validationUrl);
        console.log("++ POST request body data:" + data + ":");
        // 
        // Sample Frontline client reqeusts:
        // 
        // Worker's Customer list, GetCustomersList:
        // ++ POST request URL: https://tfpexample.herokuapp.com/frontline
        // ++ Request body data:PageSize=30&Worker=dave%40example.com&Location=GetCustomersList:
        // 
        // A customer details, GetCustomerDetailsByCustomerId
        // ++ POST request URL: https://tfpexample.herokuapp.com/frontline
        // ++ Request body data:Worker=dave%40example.com&CustomerId=2&Location=GetCustomerDetailsByCustomerId:
        //
        // Worker's message templates, GetTemplatesByCustomerId
        // ++ POST request URL: https://tfpexample.herokuapp.com/frontline
        // ++ Request body data:Worker=dave%40example.com&CustomerId=2&Location=GetTemplatesByCustomerId&ConversationSid=CH2ddc8c383b7a424387d33722d27060fb:
        // 
        // SMS Twilio phone number or Twilio WhatsApp senderid, GetProxyAddress:
        // ++ POST request URL: https://tfpexample.herokuapp.com/frontline
        // ++ Request body data:ChannelValue=%2B16505551111&Worker=dave%40example.com&CustomerId=3&ChannelType=sms&Location=GetProxyAddress:
        //      The ChannelType is used to select either a phone number or WhatsApp sender id.
        //      The value is used when sending messages.
        // 
        // ---------------------------------------------------------------------
        // Handle each type of request.
        //
        switch (theLocation) {
            case 'GetCustomerDetailsByCustomerId':
            {
                console.log("++ GetCustomerDetailsByCustomerId: " + theCustomerId);
                const customerDetails = customerData.customerDetails(theCustomerId);
                res.send({ objects: customerDetails });
                console.log('++ Success, customerDetails.display_name: ' + customerDetails.customer.display_name);
                return;
            }
            case 'GetCustomersList':
            {
                console.log("++ GetCustomersList, for worker: " + theWorker);
                const workerCustomersList = customerData.workerCustomers(theWorker);
                res.send({ objects: { customers: workerCustomersList } });
                console.log("++ Success, number of worker's customers: " + workerCustomersList.length);
                return;
            }
            case 'GetTemplatesByCustomerId':
            {
                console.log('+ GetTemplates for Customer Id: ' + theCustomerId);
                const templatesList = theTemplates.templates(theCustomerId);
                res.send( templatesList );
                console.log('++ Success getting templates, sample template: ' + templatesList[0].templates[0].content);
                return;
            }
            case 'GetProxyAddress':
            {
                // In order to start a new conversation, need a proxy address
                //  so that the app knows from which number to send a message, to the customer.
                console.log('+ GetProxyAddress, get Proxy Address, for sending messages.');
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
// All other HTTP POST requests are errors.
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
        res.sendStatus(422);
    });
});

// -----------------------------------------------------------------------------
// Echo GET HTTP requests to test that the server is running.

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