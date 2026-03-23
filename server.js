const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken'); 
const cookieParser = require('cookie-parser'); 
const axios = require('axios'); // Kept for the GNews backend route
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
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

// --- GATEKEEPER MIDDLEWARE ---
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

// --- AUTHENTICATION ROUTES ---
app.post('/api/send-otp', (req, res) => {
    const { aadhaar, phone } = req.body;
    if (!isValidAadhaar(aadhaar)) return res.status(400).json({ success: false, message: 'Invalid Aadhaar Number. Checksum failed.' });
    if (!phone || !/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: 'Invalid Mobile Number.' });

    const otp = '123456'; // Simulated OTP
    mockOtpStore[phone] = otp;
    setTimeout(() => res.json({ success: true, message: 'OTP sent to registered mobile.' }), 1000);
});

app.post('/api/verify-otp', (req, res) => {
    const { phone, otp } = req.body;

    if (mockOtpStore[phone] && mockOtpStore[phone] === otp) {
        delete mockOtpStore[phone]; 
        
        const token = jwt.sign({ citizenPhone: phone }, JWT_SECRET, { expiresIn: '1h' });
        
        // Note: Set secure to true if deploying with HTTPS
        res.cookie('auth_token', token, { httpOnly: true, secure: true }); 
        
        res.json({ success: true, message: 'Identity verified.' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }
});

// --- SECURE NEWS UPLINK ROUTE ---
app.get('/api/news', async (req, res) => {
    const countryName = req.query.country;
    if (!countryName) return res.status(400).json({ error: 'Country parameter is required' });

    try {
        const apiKey = process.env.GNEWS_API_KEY; 
        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(countryName)}&lang=en&max=5&apikey=${apiKey}`;
        const response = await axios.get(url);
        res.json(response.data); 
    } catch (error) {
        console.error("GNews API Error:", error.message);
        res.status(500).json({ error: 'Failed to fetch news briefings' });
    }
});

app.listen(PORT, () => {
    console.log(`Bharat Portal server is live! Maps to: http://localhost:${PORT}/`); 
});