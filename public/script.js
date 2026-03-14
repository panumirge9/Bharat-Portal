document.addEventListener("DOMContentLoaded", () => {
    // 1. Sticky Navigation Bar Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // 2. Smooth Scrolling for Navigation Links
    document.querySelectorAll('nav ul li a, .footer-links a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // 3. Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const icon = themeToggle.querySelector('i');
            if(body.classList.contains('light-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

    // 4. Space News Ticker Logic
    const newsItems = [
        "Gaganyaan: Final crew module recovery tests scheduled for next month.",
        "Aditya-L1: Sends first high-resolution images of the Sun's corona.",
        "Satellite Tech: Experts warn of sophisticated AI-manipulated satellite images spreading disinformation amid the US-Iran conflict.",
        "Global Space Security: IDF strikes Iranian aerospace headquarters associated with the Khayyam satellite program."
    ];
    let currentNewsIndex = 0;
    const tickerText = document.getElementById('ticker-text');
    
    if (tickerText) {
        setInterval(() => {
            tickerText.style.opacity = 0;
            setTimeout(() => {
                currentNewsIndex = (currentNewsIndex + 1) % newsItems.length;
                tickerText.textContent = newsItems[currentNewsIndex];
                tickerText.style.opacity = 1;
            }, 500); 
        }, 5000); 
    }

    // 5. Scroll Reveal Animations
    const reveals = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 }); // Lowered threshold so it triggers more reliably

    reveals.forEach(reveal => revealObserver.observe(reveal));

    // 6. Animated Counters for Statistics
    const counters = document.querySelectorAll('.counter');
    let hasCounted = false; 

    const counterObserver = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting && !hasCounted) {
            hasCounted = true;
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const speed = 200; 
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 10);
                    } else {
                        counter.innerText = target + (target > 50 ? "+" : ""); 
                    }
                };
                updateCount();
            });
        }
    }, { threshold: 0.1 }); // Lowered threshold for counters too
    
    const statsSection = document.getElementById('stats');
    if(statsSection) counterObserver.observe(statsSection);

    // 7. Countdown Timer Logic
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        let targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + 6);
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElement.innerHTML = `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
        };
        
        setInterval(updateCountdown, 1000);
        updateCountdown(); 
    }

    // 8. Generate Star Background Particles
    const starsContainer = document.getElementById('stars-container');
    if (starsContainer) {
        for (let i = 0; i < 150; i++) {
            let star = document.createElement('div');
            star.style.position = 'absolute';
            star.style.width = Math.random() * 3 + 'px';
            star.style.height = star.style.width;
            star.style.background = 'white';
            star.style.borderRadius = '50%';
            star.style.top = Math.random() * 100 + 'vh';
            star.style.left = Math.random() * 100 + 'vw';
            star.style.opacity = Math.random();
            star.style.transition = "transform 100s linear";
            starsContainer.appendChild(star);
            
            setTimeout(() => {
                 star.style.transform = `translateY(-500px) translateX(${Math.random() * 200 - 100}px)`;
            }, 100);
        }
    }

    // 9. Interactive CTA Button Alert
    const launchBtn = document.getElementById('launch-btn');
    if (launchBtn) {
        launchBtn.addEventListener('click', () => {
            alert('Liftoff Sequence Initiated! Navigating to Gaganyaan details...');
            const humanSpaceflightSection = document.getElementById('human-spaceflight');
            if (humanSpaceflightSection) {
                humanSpaceflightSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});
// 4. Fetch Dynamic Mission Data
async function loadMissions() {
    try {
        const response = await fetch('missions.json');
        const data = await response.json();
        
        const grid = document.querySelector('.mission-grid');
        grid.innerHTML = ''; // Clear the hardcoded HTML cards
        
        data.missions.forEach(mission => {
            // Create a new card for each mission in the JSON
            const card = document.createElement('div');
            card.className = 'mission-card';
            
            card.innerHTML = `
                <h3>${mission.name} <span style="font-size: 0.8rem; color: #138808;">[${mission.status}]</span></h3>
                <p>${mission.description}</p>
            `;
            
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading missions:", error);
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', loadMissions);
// 10. Search Filtering for Missions
    const searchInput = document.getElementById('searchInput');
    const missionCards = document.querySelectorAll('#missions .card');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            // Get the user's search term and convert it to lowercase
            const searchTerm = this.value.toLowerCase();

            // Loop through each mission card
            missionCards.forEach(card => {
                // Grab the text from the title and description of the card
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                
                // Check if the search term exists in either the title or description
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    // Show the card if there's a match
                    card.style.display = ''; 
                } else {
                    // Hide the card if there's no match
                    card.style.display = 'none';
                }
            });
        });
    }
