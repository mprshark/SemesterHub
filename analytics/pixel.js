const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const PIXEL_LOG = path.join(__dirname, 'pixel_logs');
if (!fs.existsSync(PIXEL_LOG)) fs.mkdirSync(PIXEL_LOG);

app.get('/track.gif', (req, res) => {
    const data = {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'] || 'direct',
        acceptLanguage: req.headers['accept-language'],
        timestamp: Date.now(),
        campaignId: req.query.cid || null,
        userId: req.query.uid || null,
        email: req.query.email || null
    };

    fs.appendFileSync(
        path.join(PIXEL_LOG, Date.now() + '.json'),
        JSON.stringify(data) + '\n'
    );

    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': pixel.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    res.end(pixel);
});

app.listen(3001, () => console.log('Pixel server on port 3001'));