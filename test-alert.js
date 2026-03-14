require('dotenv').config()
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID; 
const authToken = process.env.TWILIO_AUTH_TOKEN;

// This MUST be the number Twilio provided you in their console
const twilioNumber = process.env.TWILIO_NUMBER;

// This is your personal number where you want to receive the alert
const myPhone = '+918055893317';

const client = new twilio(accountSid, authToken);

client.messages.create({
    body: 'BHARAT PORTAL ALERT: This is a test of your emergency system!',
    to: myPhone,
    from: twilioNumber
})
.then(message => console.log('✅ Success! Alert sent. SID:', message.sid))
.catch(error => console.error('❌ Error:', error.message));