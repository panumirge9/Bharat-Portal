// 1. The Global API Key
const API_KEY = 'd01453a71ad3848c6c4d1e8b463dc49d'; 
const ATTACK_COLOR = ['#ff4444', '#ffff00']; // Bright Red to Yellow for visibility
const FLIGHT_TIME = 2000; 

// --- REAL-TIME ATTACK FEED CONFIGURATION ---
const MALWARE_FEED_URL = 'https://urlhaus-api.abuse.ch/v1/urls/recent/'; // Real OSINT feed

async function fetchRealAttacks(world) {
    try {
        const response = await fetch(MALWARE_FEED_URL);
        const data = await response.json();
        
        if (data.urls && data.urls.length > 0) {
            // Take the 5 most recent real attacks
            const recentAttacks = data.urls.slice(0, 5);
            
            recentAttacks.forEach(attack => {
                // For a true "real" attack, you would Geo-IP the IP address. 
                // Since Geo-IP usually requires an API key, we simulate the target 
                // but use real data for the alert.
                const startLat = (Math.random() - 0.5) * 160;
                const startLng = (Math.random() - 0.5) * 360;
                
                // Target a random major region (or India for your portal)
                const endLat = 20.5937; // Center of India
                const endLng = 78.9629;

                const newArc = {
                    startLat, startLng, endLat, endLng,
                    color: ['#ff0000', '#ffffff'],
                    label: `REAL THREAT: ${attack.url_status} | Source: ${attack.reporter}`,
                    arcAlt: 0.5
                };

                world.arcsData([...world.arcsData(), newArc]);
                console.warn(`[INTRUSION DETECTED]: ${attack.url}`);

                // Impact Ring
                setTimeout(() => {
                    const ring = { lat: endLat, lng: endLng, color: '#ff0000', maxR: 10 };
                    world.ringsData([...world.ringsData(), ring]);
                    
                    setTimeout(() => {
                        world.arcsData(world.arcsData().filter(a => a !== newArc));
                        world.ringsData(world.ringsData().filter(r => r !== ring));
                    }, 4000);
                }, 2000);
            });
        }
    } catch (err) {
        console.error("Failed to fetch real-time threat data:", err);
    }
}
// 1. Define a persistent array of satellite objects
const SAT_COUNT = 35;
const satellites = [...Array(SAT_COUNT).keys()].map(i => {
    const lat = (Math.random() - 0.5) * 160;
    const alt = 0.3 + Math.random() * 0.5;
    
    // Create the orbit coordinates (a circle at this latitude)
    const orbitCoords = [];
    for (let i = 0; i <= 60; i++) {
        orbitCoords.push([lat, -180 + (i * 360) / 60, alt]);
    }

    return {
        id: i,
        lat: lat,
        lng: (Math.random() - 0.5) * 360,
        alt: alt,
        speed: 0.05 + Math.random() * 0.15,
        name: `BHARAT-SAT ${100 + i}`,
        orbit: orbitCoords // Store the path here
    };
});
const satellitePaths = satellites.map(s => {
    const coords = [];
    const numPoints = 64; // How smooth the circle is
    for (let i = 0; i <= numPoints; i++) {
        // Generate a full 360-degree ring at the satellite's latitude
        const lng = -180 + (i * 360) / numPoints;
        coords.push([s.lat, lng, s.alt]); 
    }
    return {
        coords: coords,
        color: 'rgba(0, 255, 0, 0.15)' // Faint green tactical path
    };
});
document.addEventListener("DOMContentLoaded", () => {
    const globeElement = document.getElementById('globe-container');
    
    const world = Globe()(globeElement)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .polygonsData([])
        .polygonCapColor(() => 'rgba(255, 153, 51, 0.15)')
        .polygonStrokeColor(() => '#138808')
        .onPolygonClick((polygon, event, { lat, lng }) => {
            const countryName = polygon.properties.NAME || polygon.properties.name;
            world.pointOfView({ lat, lng, altitude: 1.8 }, 1000);
            fetchCountryNews(countryName);
        })
        // SATELLITE VISUAL SETTINGS
        .objectsData(satellites)
        .objectLat('lat')
        .objectLng('lng')
        .objectAltitude('alt')
        .objectLabel('name')
        .objectColor(() => '#ec1717'); // Tactical green

    // 2. THE ANIMATION LOOP: Updates every 50ms for 60fps-like smoothness
    setInterval(() => {
        satellites.forEach(s => {
            s.lng += s.speed; // Increment longitude
            if (s.lng > 180) s.lng = -180; // Wrap around the world seamlessly
        });
        
        // Trigger the Globe.gl redraw with the updated coordinates
        world.objectsData(satellites);
    }, 50);

    // Fetch Country Boundaries
    fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(countries => world.polygonsData(countries.features));
});

// 2. The Initialization Handler
document.addEventListener("DOMContentLoaded", () => {
    const globeElement = document.getElementById('globe-container');
    
    // Initialize the Globe
   // Inside your global-script.js initGlobe() function:
const world = Globe()(globeElement)

    // Use high-resolution Night Lights for a more realistic look
    .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
    // Add a bump map to give mountains and terrain physical depth
    .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
    .arcColor('color')
    .arcLabel('label') // Shows the malware source on hover
    .arcDashAnimateTime(2000)
        .arcAltitude('arcAlt')
        .arcStroke(0.8)             // Make lines thicker to see them
        .arcDashLength(0.5)         // Length of the moving dash
        .arcDashGap(2)
        .arcDashAnimateTime(FLIGHT_TIME)
    .pathsData(satellites) 
    .pathPoints('orbit')
    .pathPointLat(p => p[0])
    .pathPointLng(p => p[1])
    .pathPointAlt(p => p[2])
    .pathColor(() => 'rgba(255, 255, 255, 0.6)')
    .pathStroke(0.4)
    .pathDashLength(0.2)
    .pathDashGap(0.001)
    .pathDashAnimateTime(70000)
        // --- RING LAYER SETTINGS ---
        .ringColor(d => d.color)
        .ringMaxRadius('maxR')
        .ringPropagationSpeed(3)
        .ringRepeatPeriod(1000)
    // --- REALISM ADDITIONS ---
    .showAtmosphere(true)           // Adds a soft blue halo around Earth
    .atmosphereColor('#3a228a')     // Deep blue/purple atmospheric tint
    .atmosphereAltitude(0.15)       // Thickness of the air layer
    
    // Polygons (Countries) should be very subtle to not block the beautiful earth texture
    .polygonCapColor(() => 'rgba(255, 153, 51, 0.05)') 
    .polygonSideColor(() => 'rgba(0, 0, 0, 0.05)')
    .polygonStrokeColor(() => 'rgba(19, 136, 8, 0.4)') // Soft green borders
    
    
        // --- CLICK HANDLER FOR ZOOM ---
        
        .onPolygonClick((polygon, event, { lat, lng }) => {
            const countryName = polygon.properties.NAME || polygon.properties.name;
            
            // Zoom to the country
            world.pointOfView({ lat, lng, altitude: 1.8 }, 1000);

            // Trigger the news panel
            fetchCountryNews(countryName);
        })

    .objectsData(satellites)
    .objectLat('lat')
    .objectLng('lng')
    .objectAltitude('alt');

    // Auto-rotate setting
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.5;

    // Stop rotation when user interacts
    world.controls().addEventListener('start', () => {
        world.controls().autoRotate = false;
    });

    // Fetch Boundaries
    fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(countries => world.polygonsData(countries.features));

    // Update satellite positions periodically
    setInterval(() => {
        world.objectsData(generateMockSatellites(25));
    }, 3000);
    setInterval(() => triggerLiveAttack(world), 5000);
    // Remove all other setIntervals for satellites and use this one:
setInterval(() => {
    satellites.forEach(s => {
        s.lng += s.speed;
        if (s.lng > 180) s.lng = -180;
    });
    
    // Only update the moving dots, the paths stay static
    world.objectsData(satellites); 
}, 50);
setInterval(() => fetchRealAttacks(world), 30000);
fetchRealAttacks(world);
});

// 3. Satellite Generator
function generateMockSatellites(count) {
    return [...Array(count).keys()].map(i => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        alt: 0.3 + Math.random() * 0.4,
        name: `SATELLITE-B${100 + i}`
    }));
}

// 4. News Fetching Function with Debugging
async function fetchCountryNews(countryName) {
    const panel = document.getElementById('country-news-panel');
    const content = document.getElementById('panel-news-content');
    const title = document.getElementById('panel-country-name');

    console.log("Uplink Request Initiated for:", countryName);

    title.innerText = countryName;
    content.innerHTML = `<p style="color: #ff9933;">Establishing secure uplink for ${countryName}...</p>`;
    panel.classList.add('active');

    try {
        const url = `https://gnews.io/api/v4/search?q=${countryName}&lang=en&max=5&apikey=${API_KEY}`;
        console.log("Fetching from URL:", url);

        const res = await fetch(url);
        console.log("Server Response Status:", res.status);

        if (!res.ok) {
            const errorData = await res.json();
            console.error("API Error Details:", errorData);
            throw new Error(`Satellite link failed: ${res.status}`);
        }

        const data = await res.json();
        console.log("Received Data Packet:", data);

        if (data.articles && data.articles.length > 0) {
            content.innerHTML = data.articles.map(art => `
                <div style="border-bottom: 1px solid #333; padding: 10px 0;">
                    <h4 style="color:white; margin:0;">${art.title}</h4>
                    <p style="font-size:0.8rem; color:#888;">${art.description.substring(0, 100)}...</p>
                    <a href="${art.url}" target="_blank" style="color:#138808; text-decoration:none; font-weight:bold;">Read Briefing →</a>
                </div>
            `).join('');
        } else {
            content.innerHTML = `<p>No recent major briefings found for ${countryName}.</p>`;
        }

    } catch (e) {
        console.error("Critical Uplink Failure:", e);
        content.innerHTML = `<p style="color: #ff4444;">Uplink Error: ${e.message}</p>`;
    }
}