const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken'); 
const cookieParser = require('cookie-parser'); 
require('dotenv').config();
const app = express();
const PORT = 3000;

const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cookieParser()); 

// --- VERHOEFF ALGORITHM TABLES FOR AADHAAR VALIDATION ---
const d = [ [0,1,2,3,4,5,6,7,8,9], [1,2,3,4,0,6,7,8,9,5], [2,3,4,0,1,7,8,9,5,6], [3,4,0,1,2,8,9,5,6,7], [4,0,1,2,3,9,5,6,7,8], [5,9,8,7,6,0,4,3,2,1], [6,5,9,8,7,1,0,4,3,2], [7,6,5,9,8,2,1,0,4,3], [8,7,6,5,9,3,2,1,0,4], [9,8,7,6,5,4,3,2,1,0] ];
const p = [ [0,1,2,3,4,5,6,7,8,9], [1,5,7,6,2,8,3,0,9,4], [5,8,0,3,7,9,6,1,4,2], [8,9,1,6,0,4,3,5,2,7], [9,4,5,3,1,2,6,8,7,0], [4,2,8,6,5,7,3,9,0,1], [2,7,9,3,8,0,6,4,1,5], [7,0,4,6,9,1,3,2,5,8] ];

function isValidAadhaar(aadhaarString) {
    if (!aadhaarString || !/^\d{12}$/.test(aadhaarString)) return false;
    let c = 0;
    let aadhaarArray = aadhaarString.split('').reverse().map(Number);
    for (let i = 0; i < aadhaarArray.length; i++) {
        c = d[c][p[i % 8][aadhaarArray[i]]];
    }
    return c === 0;
}

const mockOtpStore = {};


app.use((req, res, next) => {

    const protectedPages = ['/portal.html', '/bharat-space.html', '/bharat-defence.html', '/bharat-global.html'];
    
    if (protectedPages.includes(req.path)) {
        const token = req.cookies.auth_token;
        
        if (!token) {
            console.log(`[SECURITY] Blocked unauthorized access to ${req.path}`);
            return res.redirect('/'); 
        }
        
        try {
            
            jwt.verify(token, JWT_SECRET);
            return next(); 
        } catch (err) {
            console.log(`[SECURITY] Invalid token used for ${req.path}`);
            return res.redirect('/');
        }
    }
    next(); 
});


app.use(express.static(path.join(__dirname, 'public')));


app.post('/api/send-otp', (req, res) => {
    const { aadhaar, phone } = req.body;
    if (!isValidAadhaar(aadhaar)) return res.status(400).json({ success: false, message: 'Invalid Aadhaar Number. Checksum failed.' });
    if (!phone || !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: 'Invalid Mobile Number.' });

    const otp = '123456'; 
    mockOtpStore[phone] = otp;
    setTimeout(() => res.json({ success: true, message: 'OTP sent to registered mobile.' }), 1000);
});

app.post('/api/verify-otp', (req, res) => {
    const { phone, otp } = req.body;

    if (mockOtpStore[phone] && mockOtpStore[phone] === otp) {
        delete mockOtpStore[phone]; 
        
    
        const token = jwt.sign({ citizenPhone: phone }, JWT_SECRET, { expiresIn: '1h' });
        
    
        res.cookie('auth_token', token, { httpOnly: true, secure: false }); 
        
        res.json({ success: true, message: 'Identity verified.' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }
});


const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;
const client = new twilio(accountSid, authToken);

let alertSubscribers = []; 

app.post('/api/verify-otp', (req, res) => {
    const { phone, otp } = req.body;

    if (mockOtpStore[phone] && mockOtpStore[phone] === otp) {
        delete mockOtpStore[phone]; 
        
        
        const token = jwt.sign({ citizenPhone: phone }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('auth_token', token, { httpOnly: true, secure: false });

    
        if (!alertSubscribers.includes(phone)) {
            alertSubscribers.push(phone);
            console.log(`[SUBSCRIPTION]: ${phone} is now active for alerts.`);
        }
        
        res.json({ success: true, message: 'Identity verified and alerts activated.' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }
});
app.post('/api/trigger-test-alert', async (req, res) => {
    const token = req.cookies.auth_token;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userPhone = decoded.citizenPhone;

        await client.messages.create({
            body: 'BHARAT PORTAL DEMO: This is a manually triggered test alert.',
            to: `+91${userPhone}`,
            from: twilioNumber
        });

        res.json({ success: true, message: 'Test SMS sent!' });
    } catch (err) {
        res.status(401).json({ success: false, message: 'Authentication required' });
    }
});


function sendCrisisAlert(alertContent) {
    alertSubscribers.forEach(userPhone => {
        client.messages.create({
            body: `BHARAT PORTAL CRITICAL ALERT: ${alertContent}. Move to safety.`,
            to: `+91${userPhone}`, 
            from: process.env.TWILIO_NUMBER
        })
        .then(message => console.log(`Alert sent to ${userPhone}: ${message.sid}`))
        .catch(err => console.error("SMS failed:", err));
    });
}


setTimeout(() => {
    sendCrisisAlert("Earthquake of Magnitude 6.2 detected near Delhi region");
}, 10000);


async function broadcastEmergency(eventDescription) {
    const subscribers = ['8055893317']; 

    subscribers.forEach(phone => {
        client.messages.create({
            body: `BHARAT PORTAL CRITICAL ALERT: ${eventDescription}. Stay safe.`,
            to: `+91${phone}`,
            from: '+16562680908'
        })
        .then(message => console.log(`[ALERT SENT]: ${phone}`))
        .catch(err => console.error("Broadcast failed:", err));
    });
}


const axios = require('axios'); 

async function monitorForCrisis() {
    try {
        const response = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=5');
        const latestQuake = response.data.features[0];

        if (latestQuake) {
            const description = latestQuake.properties.title;
            alertSubscribers.forEach(phone => {
                client.messages.create({
                    body: `BHARAT PORTAL CRITICAL ALERT: ${description}. Stay safe.`,
                    to: `+91${phone}`,
                    from: twilioNumber
                }).then(() => console.log(`[AUTO-ALERT SENT]: ${phone}`));
            });
        }
    } catch (error) {
        console.error("Crisis feed unreachable:", error.message);
    }
}
setInterval(monitorForCrisis, 300000);

app.listen(PORT, () => {
    console.log(`Bharat Portal server is live! Maps to: http://localhost:${PORT}/`); 
});