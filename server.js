const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- V2: In-Memory Database for Dashboard Logs ---
let attackLogs = [];
let stats = {
    totalRequests: 0,
    blockedCaptcha: 0,
    blockedRateLimit: 0,
    successfulLogins: 0,
    vulnerableLogins: 0
};

const addLog = (type, endpoint, details, status) => {
    attackLogs.unshift({
        id: Date.now() + Math.floor(Math.random()*1000),
        time: new Date().toISOString(),
        type,
        endpoint,
        details,
        status
    });
    // Keep only last 100 logs
    if(attackLogs.length > 100) attackLogs.pop();
};

// --- V2: Rate Limiter Configuration ---
// Allow only 3 requests per 10 seconds for the secure endpoint
const secureLimiter = rateLimit({
    windowMs: 10 * 1000, 
    max: 3, 
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        stats.blockedRateLimit++;
        addLog('Rate_Limit', '/api/secure-login', 'IP banned for 10 seconds. Brute force detected.', 'Blocked');
        console.error(`[SECURE] Rate Limit Exceeded by IP: ${req.ip}`);
        return res.status(429).json({ success: false, message: "Too Many Requests: Kurulumuz sizi Bot/Brute-force olarak algıladı. 10 saniye banlandınız." });
    }
});


// Mock function to verify captcha
const verifyCaptchaToken = (token) => {
    if (!token) return false;
    return token.startsWith("VALID_TOKEN_");
};

// --- VULNERABLE ENDPOINT ---
app.post('/api/vulnerable-login', (req, res) => {
    stats.totalRequests++;
    const { username, password } = req.body;
    
    // Simulating database lookup...
    if (username === 'admin' && password === 'admin') {
        stats.vulnerableLogins++;
        addLog('Bypass_Success', '/api/vulnerable-login', 'Login successful without Captcha validation!', 'Allowed (Danger)');
        console.warn(`[VULNERABLE] Successful login for ${username} - WITHOUT checking Captcha!`);
        return res.json({ success: true, message: "Login successful (Vulnerable: Captcha ignored!)" });
    } else {
        return res.status(401).json({ success: false, message: "Invalid username or password" });
    }
});

// --- SECURE ENDPOINT (Rate Limited) ---
app.post('/api/secure-login', secureLimiter, (req, res) => {
    stats.totalRequests++;
    const { username, password, captchaToken } = req.body;
    
    // 1. DONT TRUST THE FRONTEND: Verify the captcha token!
    if (!verifyCaptchaToken(captchaToken)) {
        stats.blockedCaptcha++;
        addLog('Captcha_Failure', '/api/secure-login', 'Missing or invalid token.', 'Blocked');
        console.error(`[SECURE] Blocked login attempt. Invalid or missing Captcha Token.`);
        return res.status(403).json({ success: false, message: "Security Error: Missing or invalid Captcha token!" });
    }
    
    // 2. Only proceed to verify credentials if captcha is valid
    if (username === 'admin' && password === 'admin') {
        stats.successfulLogins++;
        addLog('Login_Success', '/api/secure-login', 'Valid Token & Credentials.', 'Allowed (Safe)');
        console.log(`[SECURE] Successful login for ${username} - Captcha verified.`);
        return res.json({ success: true, message: "Login successful (Secure: Captcha verified!)" });
    } else {
        return res.status(401).json({ success: false, message: "Invalid username or password" });
    }
});

// --- DASHBOARD API ---
app.get('/api/stats', (req, res) => {
    res.json(stats);
});

app.get('/api/logs', (req, res) => {
    res.json(attackLogs);
});

app.post('/api/reset-dashboard', (req, res) => {
    attackLogs = [];
    stats = { totalRequests: 0, blockedCaptcha: 0, blockedRateLimit: 0, successfulLogins: 0, vulnerableLogins: 0 };
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`\n===========================================`);
    console.log(`🚀 [V2] System Firewall & Server running on http://localhost:${PORT}`);
    console.log(`===========================================\n`);
});
