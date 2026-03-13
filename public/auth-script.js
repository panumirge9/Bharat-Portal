document.addEventListener("DOMContentLoaded", () => {
    const requestForm = document.getElementById('request-otp-form');
    const verifyForm = document.getElementById('verify-otp-form');
    const requestMsg = document.getElementById('request-msg');
    const verifyMsg = document.getElementById('verify-msg');

    let currentPhone = '';

    // Handle OTP Request
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const aadhaar = document.getElementById('aadhaar').value;
        const phone = document.getElementById('phone').value;

        requestMsg.className = 'form-msg loading';
        requestMsg.textContent = 'Connecting to UIDAI servers...';

        try {
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ aadhaar, phone })
            });
            const data = await response.json();

            if (data.success) {
                currentPhone = phone; // Store phone for verification step
                requestForm.style.display = 'none';
                verifyForm.style.display = 'block';
            } else {
                requestMsg.className = 'form-msg error';
                requestMsg.textContent = data.message;
            }
        } catch (error) {
            requestMsg.className = 'form-msg error';
            requestMsg.textContent = 'Server connection failed.';
        }
    });

    // Handle OTP Verification
    verifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = document.getElementById('otp').value;

        verifyMsg.className = 'form-msg loading';
        verifyMsg.textContent = 'Verifying credentials...';

        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentPhone, otp })
            });
            const data = await response.json();

            if (data.success) {
                verifyMsg.className = 'form-msg success';
                verifyMsg.textContent = 'Authentication Successful. Redirecting...';
                
                // Redirect to the main portal upon success
                setTimeout(() => {
                    window.location.href = 'portal.html';
                }, 1500);
            } else {
                verifyMsg.className = 'form-msg error';
                verifyMsg.textContent = data.message;
            }
        } catch (error) {
            verifyMsg.className = 'form-msg error';
            verifyMsg.textContent = 'Verification failed.';
        }
    });
});