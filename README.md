Bharat Portal | National Intelligence & Operations Hub
A sophisticated, full-stack national portal concept showcasing India's advancements in Space, Defence, and Global Affairs. This project features a secure Aadhaar-based authentication flow, interactive 3D visualizations, and a modern "tactical" UI design.

🚀 Features
1. Secure Authentication System
Aadhaar Validation: Implements the Verhoeff Algorithm on the server side to validate Aadhaar checksums before processing.

OTP Simulation: A two-stage login process (Aadhaar/Phone -> OTP).

JWT Security: Uses JSON Web Tokens stored in HttpOnly cookies to protect sensitive routes.

Gatekeeper Middleware: A custom Express middleware ensures that internal pages (Defence, Space, Global) are inaccessible without a valid session.

2. Bharat Space (ISRO Insights)
Mission Timeline: Interactive history of India's cosmic journey from Aryabhata to Chandrayaan-3.

Live Stats: Counter animations for mission achievements.

Gaganyaan Briefing: Dedicated section for India's upcoming human spaceflight programme.

3. Bharat Defence (Tactical HUD)
Tri-Services Overview: Interactive cards for the Army, Navy, and Air Force with "tactical spark" visual effects.

Indigenous Tech: Highlights DRDO's achievements like BrahMos, LCA Tejas, and INS Vikrant.

Cyberpunk Aesthetic: Features scanlines, HUD corners, and glitch text effects for a military-command feel.

4. Bharat Global (3D Intelligence)
Interactive Globe: A high-resolution 3D Earth built with Globe.gl and Three.js.

Satellite Tracking: Real-time orbital animation of mock "BHARAT-SAT" satellites.

Live Intelligence: Click on any country to fetch real-time news briefings via the GNews API.

🛠️ Tech Stack
Frontend: HTML5, CSS3 (Custom Grid/Flexbox), JavaScript (ES6+).

Visualization: Globe.gl, Three.js.

Backend: Node.js, Express.js.

Security: jsonwebtoken, cookie-parser.
