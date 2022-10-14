# ------------------------------------------------------------------------------
echo "+++ Create Heroku application from GitHub repository."

# heroku create tfpconversations
# heroku git:remote -a tfpconversations

# Deploy command:
# git push heroku master

echo "+++ Sets Heroku environment variables."
heroku config:set MAIN_AUTH_TOKEN=...
heroku config:set FRONTLINE_SMS_NUMBER=+16505551111
heroku config:set FRONTLINE_WHATSAPP_NUMBER=+14155238886
heroku config:set FRONTLINE_TWILIO_SIGNATURE=abCDe1fg2hiJKlmnoP3quSTuvwx=
# heroku config:set PORT=8000

# chmod u+x setheroku.sh
# ./setheroku.sh

# heroku logs --tail

# ------------------------------------------------------------------------------
