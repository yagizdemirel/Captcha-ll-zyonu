document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const captchaCheck = document.getElementById('captchaCheck');
    const captchaContainer = document.getElementById('captchaWidget');
    const captchaTokenInput = document.getElementById('captchaToken');
    const consoleOutput = document.getElementById('consoleOutput');
    
    // Buttons
    const btnVulnerable = document.getElementById('btnVulnerable');
    const btnSecure = document.getElementById('btnSecure');
    const btnBotAttack = document.getElementById('btnBotAttack');
    const btnBruteForce = document.getElementById('btnBruteForce');
    
    // Dashboard Elements
    const tabBtns = document.querySelectorAll('.tab-btn');
    const viewPanels = document.querySelectorAll('.view-panel');
    const btnRefreshDash = document.getElementById('btnRefreshDash');
    const btnResetDash = document.getElementById('btnResetDash');

    // TAB SWITCHING
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            viewPanels.forEach(p => p.classList.remove('active-view'));
            
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.target}-view`).classList.add('active-view');
            
            if(btn.dataset.target === 'dashboard') {
                refreshDashboard();
            }
        });
    });

    // MOCK CAPTCHA LOGIC
    captchaCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
            setTimeout(() => {
                const fakeToken = "VALID_TOKEN_" + Math.random().toString(36).substring(2, 10);
                captchaTokenInput.value = fakeToken;
                captchaContainer.classList.add('verified');
                logToConsole(`[Frontend] Captcha doğrulandı. Token oluşturuldu: ${fakeToken}`, 'success');
            }, 500);
        } else {
            captchaTokenInput.value = "";
            captchaContainer.classList.remove('verified');
            logToConsole(`[Frontend] Captcha onayı kaldırıldı.`, 'warn');
        }
    });

    // GENERIC FETCH FUNCTION
    const sendLoginRequest = async (endpoint, data, isSilent = false) => {
        if(!isSilent) logToConsole(`[POST] İstek gönderiliyor: ${endpoint} ...`, 'info');
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            
            if(isSilent) return; // For flood/brute-force skip DOM heavy tasks

            if (response.ok) {
                logToConsole(`[Sunucu YANITI 200]: ${result.message}`, 'success');
            } else if (response.status === 429) {
                logToConsole(`[Sunucu YANITI 429]: ${result.message}`, 'error'); // Rate limit hit
            } else {
                logToConsole(`[Sunucu YANITI ${response.status}]: ${result.message}`, 'error');
            }
        } catch (error) {
            if(!isSilent) logToConsole(`[Ağ Hatası]: Sunucuya ulaşılamadı.`, 'error');
        }
    };

    // VULNERABLE LOGIN
    btnVulnerable.addEventListener('click', () => {
        const data = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            captchaToken: captchaTokenInput.value
        };
        logToConsole('--- VULNERABLE ENDPOINT TESTİ Başladı ---', 'warn');
        sendLoginRequest('/api/vulnerable-login', data);
    });

    // SECURE LOGIN
    btnSecure.addEventListener('click', () => {
        const data = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value,
            captchaToken: captchaTokenInput.value 
        };
        logToConsole('--- SECURE ENDPOINT TESTİ Başladı ---', 'info');
        sendLoginRequest('/api/secure-login', data);
    });

    // BOT ATTACK SIMULATION (SINGLE)
    btnBotAttack.addEventListener('click', () => {
        logToConsole('🤖 OTOMASYON SALDIRISI (TEKİL)', 'system');
        const botData = { username: "admin", password: "admin" }; // No Captcha Token!
        
        setTimeout(() => sendLoginRequest('/api/vulnerable-login', botData), 500);
        setTimeout(() => sendLoginRequest('/api/secure-login', botData), 1500);
    });

    // BRUTE FORCE SIMULATION (FLOOD)
    btnBruteForce.addEventListener('click', async () => {
        logToConsole('🔥 DETECTED: BRUTE FORCE ATTACK STARTING...', 'error');
        const botData = { username: "admin", password: "admin", captchaToken: "" }; // Token yok
        
        // Atak - Güvenli endpoint'in rate limiter'ına vurmak için 10 tane peş peşe gönderiyoruz:
        for(let i=1; i<=10; i++) {
            // Promise without await so they fire essentially simultaneously
            sendLoginRequest('/api/secure-login', botData, true);
        }
        
        logToConsole(`[FLOOD] 10 Adet arka arkaya "/api/secure-login" POST isteği fırlatıldı!`, 'system');
        
        // Wait a bit to show response
        setTimeout(async () => {
            // Sonuç görmek için sonuncu bir istek daha atalım
            logToConsole(`[FLOOD] Rate Limit'in banını görmek için 1 istek daha atılıyor...`, 'warn');
            sendLoginRequest('/api/secure-login', botData, false);
        }, 1000);
    });


    // --- DASHBOARD LAYER ---
    const refreshDashboard = async () => {
        try {
            // Fetch stats
            const statsRes = await fetch('/api/stats');
            const stats = await statsRes.json();
            
            document.getElementById('statTotal').innerText = stats.totalRequests;
            document.getElementById('statVulnerable').innerText = stats.vulnerableLogins;
            document.getElementById('statSuccess').innerText = stats.successfulLogins;
            document.getElementById('statCaptchaBlock').innerText = stats.blockedCaptcha;
            document.getElementById('statRateBlock').innerText = stats.blockedRateLimit;

            // Fetch logs
            const logsRes = await fetch('/api/logs');
            const logs = await logsRes.json();
            
            const tbody = document.getElementById('logsTableBody');
            tbody.innerHTML = ''; // clear
            
            logs.forEach(log => {
                const tr = document.createElement('tr');
                const time = new Date(log.time).toLocaleTimeString();
                
                let badgeClass = 'b-allowed';
                if(log.status === 'Blocked') badgeClass = log.type === 'Rate_Limit' ? 'b-banned' : 'b-blocked';
                if(log.type === 'Bypass_Success') badgeClass = 'b-danger';
                
                tr.innerHTML = `
                    <td>${time}</td>
                    <td><span style="font-family:monospace; color:var(--accent-blue)">${log.endpoint}</span></td>
                    <td>${log.type.replace('_', ' ')}</td>
                    <td><span class="badge ${badgeClass}">${log.status}</span></td>
                    <td>${log.details}</td>
                `;
                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error("Dashboard error:", error);
        }
    };

    btnRefreshDash.addEventListener('click', refreshDashboard);
    
    btnResetDash.addEventListener('click', async () => {
        await fetch('/api/reset-dashboard', { method: 'POST' });
        refreshDashboard();
    });

    // CONSOLE LOGGER
    function logToConsole(message, type = 'info') {
        const line = document.createElement('div');
        line.className = 'console-line';
        
        const timeStr = new Date().toLocaleTimeString('tr-TR', { hour12: false });
        let prefix = `[${timeStr}] `;
        
        if (type === 'error') line.classList.add('log-error');
        else if (type === 'success') line.classList.add('log-success');
        else if (type === 'warn') line.classList.add('log-warn');
        else if (type === 'system') line.classList.add('log-system');
        
        line.innerText = prefix + message;
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
});
