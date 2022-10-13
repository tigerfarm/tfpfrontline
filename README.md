# Frontline Integration Service Example

This README has information for using and implementing the application.

--------------------------------------------------------------------------------
## Getting Started

Getting started with GitHub tip, click the Code selector.
+ Click Download to download a zip file of the repository.
+ Unzip the file into a working directory.
+ Go into the directory and list the files. You will see the ".env.example" file.
+ If you are using Linus or Mac OS, use following directory listing command, "$ ls .env*".
+ Make a copy of ".env.example" into ".env".

Once unzipped and you have changed into the working repository unzipped directory,
the following command should run the application.
````
$ ls
frontline-demo-service-main.zip
/Users/dave/frontline $ unzip frontline-demo-service-main.zip
...
$ ls
frontline-demo-service-main frontline-demo-service-main.zip
$ rm *.zip
$ cd frontline-demo-service-main/
$ ls .env*
.env.example
$ cp .env.example .env
$ ls .env*
.env .env.example
$ npm start
> frontline-demo-service@0.10.0 start
> node src/index.js
/Users/dave/Projects/node_modules/twilio/lib/rest/Twilio.js:142
    throw new Error('password is required');
...
$ cat .env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_SMS_NUMBER=+xxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+xxxxxxxxxx
````
Add your values in ".env", for: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_SMS_NUMBER.

After entering values in .env, start the application.
````
$ cat .env
TWILIO_ACCOUNT_SID=AC4983h9gj34t93pg9je0ge40j3930j34g
TWILIO_AUTH_TOKEN=6589456jjk6598tjki98rtj4oidoidfk
TWILIO_SMS_NUMBER=+16505552222
TWILIO_WHATSAPP_NUMBER=whatsapp:+xxxxxxxxxx

$ yarn run start

> frontline-demo-service@0.10.0 start
> node src/index.js

body-parser deprecated undefined extended: provide extended option src/create-app.js:18:21
Application started at http://localhost:8081

 Your routes:
/callbacks/conversations
/callbacks/routing
/callbacks/outgoing-conversation
/callbacks/crm
/callbacks/templates

 Next steps:
- Use ngrok to expose port 8081
- Configure the callback URLs on your Twilio Frontline Console: https://www.twilio.com/console/frontline

 Each callback URL is a combination of your ngrok domain + the route
Read more: https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#configure-the-twilio-frontline-integration-service
````
The application is now running.

Note, use "yarn run start" or "npm start" or "node src/index.js". All will start the application.
Do an internet search if you have question regarding which way to start your application.
Yarn is recommended for speed. There are pros and cons.

Add code so that you can check that your server is running, by using a web browser.
From the following add "app.get('/', ... });" to your src/index.js file.
````
// -----------------------------------------------------------------------------
app.get('/', function (req, res) {
    res.send('+ Frontline Integration Service Application');
});

app.listen(config.port, () => {
  console.info(`Application started at http://localhost:${config.port}`);
  logRoutes(config.port);
});
````
Now, when you run your application, in your web browser go to:
use [http://localhost:8000/](http://localhost:8000/) 
and you will see the message: + Frontline Integration Service Application.

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
--data-urlencode 'From=whatsapp:+14155238886' \
--data-urlencode 'Body=Your Twilio code is 1234561' \
-u $MASTER_ACCOUNT_SID:$MASTER_AUTH_TOKEN
````

Sending SMS messages to a mobile phone number, from the Twilio WhatsApp Sandbox sender id.
````
curl -X POST https://api.twilio.com/2010-04-01/Accounts/$MASTER_ACCOUNT_SID/Messages.json \
--data-urlencode 'To=+16505552222' \
--data-urlencode 'From=+14155238886' \
--data-urlencode 'Body=Your Twilio code is 1234561' \
-u $MASTER_ACCOUNT_SID:$MASTER_AUTH_TOKEN
````

--------------------------------------------------------------------------------
## Following is the Original Application Documentation

This repository contains an example server-side web application that is required to use [Twilio Frontline](https://www.twilio.com/frontline).

## Prerequisites
- A Twilio Account. Don't have one? [Sign up](https://www.twilio.com/try-twilio) for free!
- Follow the quickstart tutorial [here](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart).
- NodeJS (latest or LTS)
- Yarn

## How to start development service

```shell script
# install dependencies
yarn

# copy environment variables
cp .env.example .env

# run service
yarn run start
```

## Environment variables

```
# Service variables
PORT # default 5000

# Twilio account variables
TWILIO_ACCOUNT_SID=ACXXX...
TWILIO_AUTH_TOKEN
TWILIO_SSO_REALM_SID=JBXXX...

# Variables for chat configuration
TWILIO_SMS_NUMBER # Twilio number for incoming/outgoing SMS
TWILIO_WHATSAPP_NUMBER # Twilio number for incoming/outgoing Whatsapp

```

## Setting up customers and mapping
The customer data can be configured in ```src/routes/callbacks/crm.js```.

Quick definition of customer's objects can be found below.

### Map between customer address + worker identity pair.
```js
{
    customerAddress: workerIdentity
}
```

Example:
```js
const customersToWorkersMap = {
    'whatsapp:+87654321': 'john@example.com'
}
```

### Customers list
Example:
```js
const customers = [
    {
        customer_id: 98,
        display_name: 'Bobby Shaftoe',
        channels: [
            { type: 'email', value: 'bobby@example.com' },
            { type: 'sms', value: '+123456789' },
            { type: 'whatsapp', value: 'whatsapp:+123456789' }
        ],
        links: [
            { type: 'Facebook', value: 'https://facebook.com', display_name: 'Social Media Profile' }
        ],
        worker: 'joe@example.com'
    }
];
```

---
Detailed information can be found in **Quickstart**, provided by Frontline team.