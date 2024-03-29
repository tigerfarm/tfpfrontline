#### Application Files

+ [webserver.js](webserver.js) : a NodeJS Express HTTP Server that processes client requests.
+ [modules/customer.js](modules/customer.js) : Customer data in JSON format, with methods to retrieve data formatted for Frontline app responses.
+ [modules/templates.js](modules/templates.js) : Template data in JSON format, with functions to process and format the templates into messages.
+ [moduleCustomersTest.js](moduleCustomersTest.js) : command line program for testing customer data queries.
+ [moduleTemplatesTest.js](moduleTemplatesTest.js) : command line program for testing template data queries.
+ [app.json](app.json) and [package.json](package.json) : for deploying to Heroku.

--------------------------------------------------------------------------------
# Frontline Integration Service Example

This README has information for using and implementing a Frontline Integration Service web application.

Frontline client worker apps for testing:
+ Twilio Frontline mobile app that is available of Google Play, and for Apple devices.
+ Twilio Frontline web application you can use for testing:
[Frontline web application](https://frontline.twilio.com/login)

This web application handles the HTTP requests from a Twilio Frontline client worker app:
+ Frontline worker's customer list.
+ Customer's details.
+ Message templates to use when sending a message.
+ SMS Twilio phone number or Twilio WhatsApp senderid, to use when sending a message.

--------------------------------------------------------------------------------
## Getting Started with this Repository

Download the repositry files to your working directoy.
From GitHub repositry page, click the Code selector button.
+ Click Download to download a zip file of the repository.
+ Unzip the file into a working directory.
+ Go into the directory and list the files.

Create environment variables. For example:
````
export MAIN_AUTH_TOKEN=...
export FRONTLINE_TWILIO_SIGNATURE=abCDe1fg2hiJKlmnoP3quSTuvwx=
export FRONTLINE_SMS_NUMBER=+16505551111
export FRONTLINE_WHATSAPP_NUMBER:+14155551111
````
Start the web server.
````
$ node webserver.js 
+++ Start Frontline Integration Service Application web server, integration to CRM data.
+ From a browser, can check that the server is running.
+ Listening on port: 8080
````
Once running, use the following cURL commands to test the application.

Following are sample Frontline app requests.
Note, the value of the environment value FRONTLINE_TWILIO_SIGNATURE,
is used as a test validation signature in the header of an HTTP request.
The request will be allowed.
````
curl -X POST 'http://localhost:8080/frontline' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'x-twilio-signature: abCDe1fg2hiJKlmnoP3quSTuvwx=' \
  --data-urlencode "Location=GetCustomersList" \
  --data-urlencode "Worker=dave@example.com"

curl -X POST 'http://localhost:8080/frontline' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'x-twilio-signature: abCDe1fg2hiJKlmnoP3quSTuvwx=' \
  --data-urlencode "Location=GetCustomerDetailsByCustomerId" \
  --data-urlencode "CustomerId=2"

curl -X POST 'http://localhost:8080/frontline' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'x-twilio-signature: abCDe1fg2hiJKlmnoP3quSTuvwx=' \
  --data-urlencode "Location=GetProxyAddress" \
  --data-urlencode "channelName=sms"

curl -X POST 'http://localhost:8080/frontline' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'x-twilio-signature: abCDe1fg2hiJKlmnoP3quSTuvwx=' \
  --data-urlencode "Location=GetProxyAddress" \
  --data-urlencode "channelName=whatsapp"

curl -X POST 'http://localhost:8080/frontline' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'x-twilio-signature: abCDe1fg2hiJKlmnoP3quSTuvwx=' \
  --data-urlencode "Location=GetTemplatesByCustomerId" \
  --data-urlencode "CustomerId=2"

* Confirm the templates are using another worker's data.
curl -X POST 'http://localhost:8080/frontline' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'x-twilio-signature: abCDe1fg2hiJKlmnoP3quSTuvwx=' \
  --data-urlencode "Location=GetTemplatesByCustomerId" \
  --data-urlencode "CustomerId=3"
````

--------------------------------------------------------------------------------
## Once Setup, Using Okta Admin to Manage Frontline Worker Access

To use a Frontline app, Frontline workers are added into an SSO management application system.
I'm using Okta because there is Twilio Frontline documentation for Okta, and there is a free option that works for my requirements.

Steps to Configure [Okta as a Frontline SSO Identity Provider](https://www.twilio.com/docs/frontline/sso/okta):
````
1. Register a developer account at Okta
2. Create an application on Okta
3. Configure your Application (in Okta)
4. Configure Claims (in Okta)
5. Copy Application details: get information for Okta, to use in Twilio Frontline configurations.
6. Assign Users to the Application
7. Configure Frontline with your new SAML credentials: paste Okta information into your Twilio Frontline SSO configurations.
````

Following are some Okta dashboard location to view and manage Frontline information.

Log into [my Okta account](https://dev-12345678.okta.com/).
````
Applications/Applications, click your application: Owl Press
Under the "Assignments" option, left option "People", is the list your Okta users,
    "Persons" assigned to this application.
Click a Person.
Click Profile.
    You will see: User type/userType is "agent" (Configure Claims setting).

Under the "Sign On" option, is the SAML Signing Certificates information.
In the table, beside: SHA-1, click Actions and select View IdP MetaData.
    This will display the Frontline/Manage/SSO/Log in values,
        + Frontline Identity provider issuer URL (entityID attribute):
        http://www.okta.com/ex...d7
        + Frontline SSO URL(SingleSignOnService attribute):
        https://dev-12345678.okta.com/app/dev-12345678_owlpress_1/ex...d7/sso/saml
        + Frontline X.509 Certificate (X509Certificate attribute)
        MIID...pDw==

Under the "General" option, is the Frontline SAML Settings,
    That include your Frontline JBxxx id.
    Table that should be:
Attribute Statements
Name    Name Format Value
email   Basic       user.email
roles   Basic       user.userType
````

How to Configure Okta as a Frontline Identity Provider
https://www.twilio.com/docs/frontline/sso/okta
````
1. Register a developer account at Okta
2. Create an application on Okta
3. Configure your Application (in Okta)
4. Configure Claims (in Okta)
5. Copy Application details: get information for Okta, to use in Twilio Frontline configurations.
6. Assign Users to the Application
7. Configure Frontline with your new SAML credentials: paste Okta information into your Twilio Frontline SSO configurations.
````
Okta SAML setting:

<img src="images/FrontlineOktaSaml1a.jpg" width="400"/>

--------------------------------------------------------------------------------
## Frontline Twilio Console Configurations

My Frontline [set up steps and configurations](https://github.com/tigerfarm/work/tree/master/book/Frontline).

Twilio console: Develop/Frontline/Manage/SSO/Log in
+ Frontline Workspace ID
+ Realm SID: JB id autogenerated when having clicked, Create, in Twilio console: Develop/Frontline/Overview
+ Okta value for: Identity provider issuer
+ Okta value for: SSO URL
+ Okta value for: X.509 Certificate

<img src="images/frontlineSsoOkta1.jpg" width="600"/>

---------------------------------------------------
Twilio console: Develop/Frontline/Manage/Callbacks
+ Note, the 3 URLs have the same URI: "/frontline", which matches how the [webserver.js](webserver.js) handles requests.

````
app.post("/frontline", function (req, res) {
...
}
````

<img src="images/FrontlineCallbacks.jpg" width="600"/>

---------------------------------------------------
Twilio console: Develop/Frontline/Overview
+ For configuration of: Conversations service name and Conversations service SID, 
See Conversations configurations.

<img src="images/FrontlineOverview.jpg" width="600"/>

---------------------------------------------------
Twilio console: Develop/Messaging Services, 
click the Frontline Conversation Messaging service SID, for example: MG634319110a48b2e82f1a08247cd8f0ba

Messaging service SID/Integration, enabled: Autocreate a Conversation.

<img src="images/FrontlineMSintegration.jpg" width="600"/>

Messaging service SID/Sender Pool, with the Twilio phone number used to send Conversations SMS messages.

<img src=FrontlineMSsenderPool.jpg" width="600"/>

---------------------------------------------------
Twilio console: Develop/Conversations/Manage/Defaults:
+ Set to: Unlock, Handle Inbound Messages with Conversations.
This allows inbound messages to use the Messaging Service setting to Autocreate a New Conversation.
+ Configure/Default Messaging Service, is the Messaging Service used for Frontline SMS messages.
+ Default Conversation Service, is the Conversations service SID used for Frontline conversations
example SID: IS186702e405b74452a449d67b9265669f.

<img src="images/FrontlineConversationsDefaults.jpg" width="600"/>

Once Frontline conversations are flowing, use the following to list and view the conversations.

Twilio console: Develop/Conversations/Manage,
+ Click the Frontline service, example SID: IS186702e405b74452a449d67b9265669f
+ Click Conversations

<img src="images/FrontlineConversationsList.jpg" width="600"/>

--------------------------------------------------------------------------------
## Using Frontline with the Twilio WhatsApp Sandbox

I setup my Frontline system to use the Twilio WhatsApp Sandbox.

Results of my testing:
+ I can use a program(I use curl) to send template messages to my WhatsApp user.
+ In my WhatsApp user app, I can receive and read messages from my program.
+ In my WhatsApp user app, I can send messages to my Frontline user.
+ In my Frontline app, I can receive and read messages from my WhatsApp user.
+ In my Frontline app, I can reply to the received messages from my WhatsApp user.
+ In my WhatsApp user app, I can receive and read messages from my Frontline user.

To use Twilio WhatsApp Sandbox templates, or pre-approved account templates:
+ Add the template into .../routes/callbacks/templates.js.
+ Where required, add template parameters for the template.
+ In the Frontline app, when selecting a WhatsApp conversation, if not within a 24 hour session, I'm prompted to select a template. For example: "Reach out to John". When I click the Reach-out prompt, I can see the Sandbox templated message with the parameters filled in. If I click it, it's sent to my WhatsApp user.
+ In my WhatsApp user app, I can receive and read the templated message from my Frontline user.

Notes,
+ Frontline requires templates to be added into the integration service via the templates callback URL, and indicate that it’s a pre-approved WhatsApp template: attribute: whatsAppApproved: true.
+ I added a sample Sandbox template into my WhatsApp integration application. Program sample:
[templates.js](https://github.com/tigerfarm/tfpfrontline/blob/master/src/routes/callbacks/templates.js).

Sending WhatsApp messages to a WhatsApp user, from the Twilio WhatsApp Sandbox sender id.
````
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$MASTER_ACCOUNT_SID/Messages.json \
--data-urlencode 'To=whatsapp:+16505552222' \
--data-urlencode 'From=whatsapp:+14155551111' \
--data-urlencode 'Body=Your Twilio code is 1234561' \
-u $MASTER_ACCOUNT_SID:$MASTER_AUTH_TOKEN
````

Sending SMS messages to a mobile phone number, from the Twilio WhatsApp Sandbox sender id.
````
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$MASTER_ACCOUNT_SID/Messages.json \
--data-urlencode 'To=+16505552222' \
--data-urlencode 'From=+14155551111' \
--data-urlencode 'Body=Your Twilio code is 1234561' \
-u $MASTER_ACCOUNT_SID:$MASTER_AUTH_TOKEN
````

--------------------------------------------------------------------------------
## Links

My Frontline [set up steps and configurations](https://github.com/tigerfarm/work/tree/master/book/Frontline).

[Frontline application](https://github.com/twilio/frontline-demo-service)
I've cloned and updated in this repository.

--------------------------------------------------------------------------------

Cheers...