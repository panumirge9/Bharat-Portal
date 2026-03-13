document.addEventListener("DOMContentLoaded", () => {

    const serviceCards = document.querySelectorAll('.service-card');
    
    // Double click navigation
    serviceCards.forEach(card => {
        card.addEventListener('dblclick', () => {

            if (card.classList.contains('army')) {
                window.location.href = 'army.html';
            }

            if (card.classList.contains('navy')) {
                window.location.href = 'navy.html';
            }

            if (card.classList.contains('airforce')) {
                window.location.href = 'airforce.html';
            }
        });
    });

    // Tactical sparks effect
    const defenceHero = document.querySelector('.defence-hero');

    if (defenceHero) {

        for (let i = 0; i < 40; i++) {

            let spark = document.createElement('div');
            spark.className = 'tactical-spark';

            spark.style.left = Math.random() * 100 + '%';
            spark.style.animationDuration = (Math.random() * 2 + 2) + 's';
            spark.style.animationDelay = Math.random() * 3 + 's';

            defenceHero.appendChild(spark);
        }
    }

    // Extra information
    const extraDetails = {
        army: "<strong>Motto:</strong> Service Before Self.<br><br>The Indian Army is the second-largest standing army in the world with strong mountain warfare capabilities.",
        navy: "<strong>Motto:</strong> May the Lord of the Water be auspicious unto us.<br><br>A blue-water navy with aircraft carriers, submarines and destroyers.",
        airforce: "<strong>Motto:</strong> Touch the sky with glory.<br><br>One of the world's strongest air forces with Rafale, Sukhoi and Tejas aircraft."
    };

    serviceCards.forEach(card => {

        const details = document.createElement('div');
        details.classList.add('service-details');

        if (card.classList.contains('army')) details.innerHTML = extraDetails.army;
        if (card.classList.contains('navy')) details.innerHTML = extraDetails.navy;
        if (card.classList.contains('airforce')) details.innerHTML = extraDetails.airforce;

        card.appendChild(details);

        card.addEventListener('click', () => {

            serviceCards.forEach(other => {
                if (other !== card) {
                    other.classList.remove('expanded');
                }
            });

            card.classList.toggle('expanded');
        });

    });

});
