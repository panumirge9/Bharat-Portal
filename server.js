const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken'); // NEW: For generating tokens
const cookieParser = require('cookie-parser'); // NEW: For reading cookies

const app = express();
const PORT = 3000;

// Secret key for signing tokens (In a real app, hide this in a .env file)
const JWT_SECRET = 'bharat_super_secret_key_2026';

app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing

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

// --- NEW: THE GATEKEEPER MIDDLEWARE ---
// This runs before sending any files to the user
app.use((req, res, next) => {
    // List of pages that require authentication
    const protectedPages = ['/portal.html', '/bharat-space.html', '/bharat-defence.html', '/bharat-global.html'];
    
    if (protectedPages.includes(req.path)) {
        const token = req.cookies.auth_token;
        
        if (!token) {
            console.log(`[SECURITY] Blocked unauthorized access to ${req.path}`);
            return res.redirect('/'); // Kick back to login
        }
        
        try {
            // Verify the token is real and hasn't been tampered with
            jwt.verify(token, JWT_SECRET);
            return next(); // Token is good, let them see the page
        } catch (err) {
            console.log(`[SECURITY] Invalid token used for ${req.path}`);
            return res.redirect('/');
        }
    }
    next(); // If it's not a protected page (like CSS or the login page), let it through
});

// Serve static files AFTER the gatekeeper checks them
app.use(express.static(path.join(__dirname, 'public')));

// --- API ROUTES ---
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
        
        // NEW: Generate a secure JWT valid for 1 hour
        const token = jwt.sign({ citizenPhone: phone }, JWT_SECRET, { expiresIn: '1h' });
        
        // Send the token to the browser as an HTTP-Only cookie (safe from cross-site scripting)
        res.cookie('auth_token', token, { httpOnly: true, secure: false }); // secure: false because we are on localhost HTTP, not HTTPS
        
        res.json({ success: true, message: 'Identity verified.' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }
});

app.listen(PORT, () => {
    console.log(`Bharat Portal server is live! Maps to: http://localhost:${PORT}/`); 
});