(function () {
    'use strict';

    const FP_ENDPOINT = '/api/analytics';
    const STORAGE_KEY = 'device_id';
    const SESSION_KEY = 'session_id';

    class ClientProfiler {
        constructor() {
            this.profile = {};
            this.sessionId = this.getOrCreateSessionId();
            this.deviceId = localStorage.getItem(STORAGE_KEY) || null;
        }

        getOrCreateSessionId() {
            let sid = sessionStorage.getItem(SESSION_KEY);
            if (!sid) {
                sid = 'sess_' + crypto.randomUUID();
                sessionStorage.setItem(SESSION_KEY, sid);
            }
            return sid;
        }

        async collectHardware() {
            const hw = {};

            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                    hw.gpu = {
                        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                    };
                    hw.webglHash = this.webglFingerprint(gl);
                }
            } catch (e) { hw.gpuError = e.message; }

            hw.hardwareConcurrency = navigator.hardwareConcurrency || 'unknown';
            hw.deviceMemory = navigator.deviceMemory || 'unknown';
            hw.canvasHash = this.canvasFingerprint();
            hw.audioHash = await this.audioFingerprint();

            this.profile.hardware = hw;
            return hw;
        }

        canvasFingerprint() {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');

            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#f60';
            ctx.fillRect(100, 50, 50, 50);
            ctx.fillStyle = '#069';
            ctx.font = '16px Arial';
            ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 2, 150);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.font = '18px Times New Roman';
            ctx.fillText('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 4, 200);

            return this.hashCanvas(canvas);
        }

        hashCanvas(canvas) {
            const dataUrl = canvas.toDataURL();
            let hash = 0;
            for (let i = 0; i < dataUrl.length; i++) {
                const char = dataUrl.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            return hash.toString(16);
        }

        async audioFingerprint() {
            try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const analyser = audioCtx.createAnalyser();
                const gainNode = audioCtx.createGain();

                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(10000, audioCtx.currentTime);
                oscillator.connect(analyser);
                analyser.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                oscillator.start(0);
                oscillator.stop(0.1);

                const data = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(data);

                let hash = 0;
                for (let i = 0; i < data.length; i++) {
                    hash = ((hash << 5) - hash) + data[i];
                    hash |= 0;
                }

                await audioCtx.close();
                return hash.toString(16);
            } catch (e) {
                return 'audio_unavailable';
            }
        }

        webglFingerprint(gl) {
            const vertices = new Float32Array([
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
                0.0, 0.5, 0.0
            ]);

            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, `
                attribute vec3 position;
                void main() { gl_Position = vec4(position, 1.0); }
            `);
            gl.compileShader(vertexShader);

            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, `
                precision highp float;
                void main() { gl_FragColor = vec4(0.5, 0.2, 0.8, 1.0); }
            `);
            gl.compileShader(fragmentShader);

            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            const pos = gl.getAttribLocation(program, 'position');
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0);

            gl.viewport(0, 0, 1, 1);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            const pixel = new Uint8Array(4);
            gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

            return Array.from(pixel).map(b => b.toString(16).padStart(2, '0')).join('');
        }

        collectBrowser() {
            const br = {};

            br.userAgent = navigator.userAgent;
            br.languages = navigator.languages;
            br.language = navigator.language;
            br.platform = navigator.platform;
            br.doNotTrack = navigator.doNotTrack;
            br.cookieEnabled = navigator.cookieEnabled;
            br.pdfViewerEnabled = navigator.pdfViewerEnabled;
            br.fonts = this.detectFonts();
            br.screen = {
                width: screen.width,
                height: screen.height,
                availWidth: screen.availWidth,
                availHeight: screen.availHeight,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth,
                orientation: screen.orientation ? screen.orientation.type : 'unknown'
            };
            br.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            br.timezoneOffset = new Date().getTimezoneOffset();
            br.plugins = Array.from(navigator.plugins || []).map(p => ({
                name: p.name,
                filename: p.filename,
                description: p.description
            }));
            br.maxTouchPoints = navigator.maxTouchPoints;
            br.touchSupport = 'ontouchstart' in window;
            br.storage = {
                localStorage: !!window.localStorage,
                sessionStorage: !!window.sessionStorage,
                indexedDB: !!window.indexedDB
            };

            this.profile.browser = br;
            return br;
        }

        detectFonts() {
            const baseFonts = ['monospace', 'sans-serif', 'serif'];
            const fontList = [
                'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria',
                'Cambria Math', 'Comic Sans MS', 'Consolas', 'Courier New',
                'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
                'Microsoft Sans Serif', 'MS Gothic', 'MS PGothic', 'MS UI Gothic',
                'Palatino Linotype', 'Segoe UI', 'Tahoma', 'Times New Roman',
                'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings'
            ];

            const testString = 'mmmmmmmmmmlli';
            const testSize = '72px';
            const h = document.createElement('span');
            h.style.position = 'absolute';
            h.style.left = '-9999px';
            h.style.fontSize = testSize;
            h.innerHTML = testString;
            document.body.appendChild(h);

            const detected = [];
            for (const font of fontList) {
                let found = false;
                for (const base of baseFonts) {
                    h.style.fontFamily = `"${font}",${base}`;
                    const width1 = h.offsetWidth;
                    const height1 = h.offsetHeight;

                    h.style.fontFamily = base;
                    const width2 = h.offsetWidth;
                    const height2 = h.offsetHeight;

                    if (width1 !== width2 || height1 !== height2) {
                        found = true;
                        break;
                    }
                }
                if (found) detected.push(font);
            }

            document.body.removeChild(h);
            return detected;
        }

        async collectNetwork() {
            const net = {};

            net.localIPs = await this.getLocalIPs();

            if (navigator.connection) {
                net.connection = {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    saveData: navigator.connection.saveData
                };
            }

            net.geoHint = await this.getGeo();

            this.profile.network = net;
            return net;
        }

        async getLocalIPs() {
            return new Promise((resolve) => {
                const ips = [];
                try {
                    const pc = new RTCPeerConnection({ iceServers: [] });
                    pc.createDataChannel('');
                    pc.createOffer().then(offer => pc.setLocalDescription(offer));

                    pc.onicecandidate = (ice) => {
                        if (!ice || !ice.candidate || !ice.candidate.candidate) {
                            pc.close();
                            resolve(ips);
                            return;
                        }
                        const ipMatch = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                        if (ipMatch && !ips.includes(ipMatch[1])) {
                            ips.push(ipMatch[1]);
                        }
                    };

                    setTimeout(() => {
                        pc.close();
                        resolve(ips);
                    }, 2000);
                } catch (e) {
                    resolve(['unavailable']);
                }
            });
        }

        async getGeo() {
            return new Promise((resolve) => {
                if (!navigator.geolocation) {
                    resolve('unavailable');
                    return;
                }
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        resolve({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            accuracy: pos.coords.accuracy,
                            timestamp: pos.timestamp
                        });
                    },
                    (err) => {
                        resolve('denied:' + err.code);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            });
        }

        collectOS() {
            const os = {};
            const ua = navigator.userAgent;

            os.rawUA = ua;

            if (ua.includes('Windows NT 10.0')) os.name = 'Windows 10/11';
            else if (ua.includes('Windows NT 6.3')) os.name = 'Windows 8.1';
            else if (ua.includes('Windows NT 6.1')) os.name = 'Windows 7';
            else if (ua.includes('Mac OS X')) {
                const match = ua.match(/Mac OS X (\d+[._]\d+)/);
                os.name = match ? 'macOS ' + match[1].replace('_', '.') : 'macOS';
            }
            else if (ua.includes('Linux')) os.name = 'Linux';
            else if (ua.includes('Android')) {
                const match = ua.match(/Android (\d+(\.\d+)*)/);
                os.name = match ? 'Android ' + match[1] : 'Android';
            }
            else if (ua.includes('iPhone') || ua.includes('iPad')) {
                const match = ua.match(/OS (\d+[_\d]+)/);
                os.name = match ? 'iOS ' + match[1].replace(/_/g, '.') : 'iOS';
            }
            else os.name = 'Unknown';

            os.arch = ua.includes('x64') || ua.includes('x86_64') || ua.includes('Win64') ? 'x64' :
                ua.includes('arm') || ua.includes('ARM') ? 'ARM' : 'Unknown';

            this.profile.os = os;
            return os;
        }

        setupAPIMonitoring() {
            const originalFetch = window.fetch;
            const self = this;

            window.fetch = function () {
                const args = arguments;
                const url = args[0];
                const method = args[1]?.method || 'GET';
                const body = args[1]?.body || null;

                self.logAPICall(url, method, body, 'fetch');

                return originalFetch.apply(this, args).then(response => {
                    self.logAPIResponse(url, response.status, 'fetch');
                    return response;
                });
            };

            const originalOpen = XMLHttpRequest.prototype.open;
            const originalSend = XMLHttpRequest.prototype.send;

            XMLHttpRequest.prototype.open = function (method, url) {
                this._monitoredUrl = url;
                this._monitoredMethod = method;
                return originalOpen.apply(this, arguments);
            };

            XMLHttpRequest.prototype.send = function (body) {
                self.logAPICall(this._monitoredUrl, this._monitoredMethod, body, 'xhr');

                this.addEventListener('load', function () {
                    self.logAPIResponse(this._monitoredUrl, this.status, 'xhr');
                });

                return originalSend.apply(this, arguments);
            };
        }

        logAPICall(url, method, body, type) {
            const entry = {
                url: typeof url === 'string' ? url : url.url,
                method: method,
                bodySize: body ? (typeof body === 'string' ? body.length : JSON.stringify(body).length) : 0,
                timestamp: Date.now(),
                type: type
            };

            if (!this.profile.apiCalls) this.profile.apiCalls = [];
            this.profile.apiCalls.push(entry);
        }

        logAPIResponse(url, status, type) {
            const entry = {
                url: typeof url === 'string' ? url : url?.url,
                status: status,
                timestamp: Date.now(),
                type: type
            };

            if (!this.profile.apiResponses) this.profile.apiResponses = [];
            this.profile.apiResponses.push(entry);
        }

        setupMonitoring() {
            const self = this;

            const element = new Image();
            Object.defineProperty(element, 'id', {
                get: () => {
                    self.profile.devtoolsDetected = true;
                }
            });
            console.log('%c', element);

            setInterval(() => {
                const timing = performance.now();
                if (!self.profile.timingPatterns) self.profile.timingPatterns = [];
                self.profile.timingPatterns.push(timing % 1000);
            }, 500);
        }

        async collectAll() {
            await this.collectHardware();
            this.collectBrowser();
            await this.collectNetwork();
            this.collectOS();
            this.setupAPIMonitoring();
            this.setupMonitoring();

            this.profile.fingerprintHash = this.computeHash();
            this.profile.sessionId = this.sessionId;
            this.profile.timestamp = Date.now();
            this.profile.pageUrl = window.location.href;
            this.profile.referrer = document.referrer;

            return this.profile;
        }

        computeHash() {
            const str = JSON.stringify({
                hw: this.profile.hardware,
                br: this.profile.browser,
                os: this.profile.os
            });

            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash |= 0;
            }
            return 'fp_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);
        }

        async submit() {
            try {
                const encrypted = await this.encrypt(this.profile);

                const response = await fetch(FP_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        profile: encrypted,
                        deviceId: this.deviceId,
                        sessionId: this.sessionId
                    })
                });

                const result = await response.json();
                if (result.deviceId) {
                    this.deviceId = result.deviceId;
                    localStorage.setItem(STORAGE_KEY, result.deviceId);
                }

                return result;
            } catch (e) {
                console.error('Submission failed:', e);
            }
        }

        async encrypt(data) {
            const text = JSON.stringify(data);
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(text);

            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(this.sessionId.padEnd(32, '0').slice(0, 32)),
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );

            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                dataBuffer
            );

            const payload = {
                iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
                data: Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('')
            };

            localStorage.setItem('enc_' + this.sessionId, JSON.stringify(payload));
            return payload;
        }
    }

    const profiler = new ClientProfiler();
    profiler.collectAll().then(() => {
        setTimeout(() => profiler.submit(), 2000);
    });

    setInterval(() => {
        profiler.collectAll().then(() => profiler.submit());
    }, 30000);

    window.__cp = profiler;
})();