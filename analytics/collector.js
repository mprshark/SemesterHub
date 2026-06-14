const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
app.use(express.json({ limit: '50mb' }));

const DB_PATH = path.join(__dirname, 'data');
if (!fs.existsSync(DB_PATH)) fs.mkdirSync(DB_PATH);

const ENCRYPTION_KEY = crypto.randomBytes(32);
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'utf8', 'hex');
    decrypted += decipher.final('utf8');
    return decrypted;
}

app.post('/api/analytics', (req, res) => {
    const { profile, deviceId, sessionId } = req.body;

    const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.connection.remoteAddress;

    geoLocateIP(clientIP).then(geoData => {
        const record = {
            profile: profile,
            serverData: {
                ip: clientIP,
                geo: geoData,
                timestamp: Date.now(),
                userAgent: req.headers['user-agent'],
                acceptLanguage: req.headers['accept-language'],
                headers: req.headers
            },
            deviceId: deviceId || null,
            sessionId: sessionId,
            firstSeen: Date.now(),
            lastSeen: Date.now()
        };

        const storeKey = deviceId || sessionId;
        const filePath = path.join(DB_PATH, storeKey.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json');

        if (fs.existsSync(filePath)) {
            const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            existing.lastSeen = Date.now();
            existing.visits = (existing.visits || 0) + 1;
            existing.profiles = existing.profiles || [];
            existing.profiles.push(record);
            fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
        } else {
            record.visits = 1;
            record.profiles = [record];
            fs.writeFileSync(filePath, JSON.stringify(record, null, 2));
        }

        const newDeviceId = deviceId || crypto.randomUUID();
        res.json({
            status: 'ok',
            deviceId: newDeviceId,
            sessionId: sessionId,
            known: !!deviceId
        });
    });
});

async function geoLocateIP(ip) {
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') ||
        ip.startsWith('10.') || ip.startsWith('172.')) {
        return { type: 'private', ip: ip };
    }

    try {
        const data = await new Promise((resolve, reject) => {
            http.get(`http://ip-api.com/json/${ip}`, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve(JSON.parse(body)));
            }).on('error', reject);
        });

        return {
            ip: ip,
            country: data.country,
            countryCode: data.countryCode,
            region: data.region,
            regionName: data.regionName,
            city: data.city,
            zip: data.zip,
            lat: data.lat,
            lon: data.lon,
            timezone: data.timezone,
            isp: data.isp,
            org: data.org,
            as: data.as
        };
    } catch (e) {
        return { ip: ip, error: e.message };
    }
}

app.get('/api/correlate/:identifier', (req, res) => {
    const id = req.params.identifier;

    const results = [];
    const files = fs.readdirSync(DB_PATH);

    for (const file of files) {
        if (file.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(path.join(DB_PATH, file), 'utf8'));

            if (data.deviceId === id || data.sessionId === id ||
                file.replace('.json', '') === id) {
                results.push(data);
            }

            if (data.profiles) {
                for (const p of data.profiles) {
                    const pData = p.profile;
                    if (pData && pData.fingerprintHash === id) {
                        if (!results.find(r => r.deviceId === data.deviceId)) {
                            results.push(data);
                        }
                    }
                }
            }
        }
    }

    res.json({
        identifier: id,
        matches: results.length,
        records: results.map(r => ({
            deviceId: r.deviceId,
            sessionId: r.sessionId,
            visits: r.visits || 1,
            firstSeen: r.firstSeen,
            lastSeen: r.lastSeen,
            ip: r.profiles?.[0]?.serverData?.ip || 'unknown',
            geo: r.profiles?.[0]?.serverData?.geo || null,
            browserInfo: r.profiles?.[0]?.serverData?.userAgent || null
        }))
    });
});

app.get('/admin/analytics', (req, res) => {
    const files = fs.readdirSync(DB_PATH);
    const summary = {
        totalDevices: files.length,
        totalVisits: 0,
        devices: []
    };

    for (const file of files) {
        if (file.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(path.join(DB_PATH, file), 'utf8'));
            summary.totalVisits += data.visits || 1;
            summary.devices.push({
                deviceId: data.deviceId || file.replace('.json', ''),
                visits: data.visits || 1,
                firstSeen: new Date(data.firstSeen).toISOString(),
                lastSeen: new Date(data.lastSeen).toISOString(),
                ip: data.profiles?.[0]?.serverData?.ip || 'unknown',
                location: data.profiles?.[0]?.serverData?.geo?.city || 'unknown'
            });
        }
    }

    res.json(summary);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Collector running on port ${PORT}`);
});