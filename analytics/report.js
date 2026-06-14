const fs = require('fs');
const path = require('path');

class Correlator {
    constructor(dbPath) {
        this.dbPath = dbPath;
    }

    correlateBySimilarity(threshold = 0.85) {
        const records = this.loadAll();
        const clusters = [];

        for (let i = 0; i < records.length; i++) {
            let matched = false;
            for (const cluster of clusters) {
                const similarity = this.compare(
                    records[i].profiles?.[0],
                    cluster[0].profiles?.[0]
                );
                if (similarity >= threshold) {
                    cluster.push(records[i]);
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                clusters.push([records[i]]);
            }
        }

        return clusters;
    }

    compare(fp1, fp2) {
        if (!fp1 || !fp2) return 0;

        const weights = {
            canvasHash: 0.15,
            webglHash: 0.15,
            audioHash: 0.10,
            fonts: 0.10,
            screen: 0.10,
            hardwareConcurrency: 0.05,
            deviceMemory: 0.05,
            platform: 0.05,
            timezone: 0.10,
            languages: 0.05,
            gpu: 0.10
        };

        let score = 0;
        let totalWeight = 0;

        for (const [key, weight] of Object.entries(weights)) {
            totalWeight += weight;
            if (this.matchFields(fp1, fp2, key)) {
                score += weight;
            }
        }

        return totalWeight > 0 ? score / totalWeight : 0;
    }

    matchFields(fp1, fp2, field) {
        if (!fp1 || !fp2) return false;

        const f1 = fp1.profile;
        const f2 = fp2.profile;

        if (!f1 || !f2) return false;

        if (field === 'screen') {
            return f1.browser?.screen?.width === f2.browser?.screen?.width &&
                f1.browser?.screen?.height === f2.browser?.screen?.height;
        }
        if (field === 'fonts') {
            return JSON.stringify(f1.browser?.fonts) === JSON.stringify(f2.browser?.fonts);
        }
        if (field === 'gpu') {
            return f1.hardware?.gpu?.renderer === f2.hardware?.gpu?.renderer;
        }
        if (field === 'languages') {
            return JSON.stringify(f1.browser?.languages) === JSON.stringify(f2.browser?.languages);
        }

        const val1 = field.includes('.')
            ? field.split('.').reduce((o, k) => o?.[k], f1)
            : f1[field];
        const val2 = field.includes('.')
            ? field.split('.').reduce((o, k) => o?.[k], f2)
            : f2[field];

        return val1 !== undefined && val1 === val2;
    }

    loadAll() {
        const files = fs.readdirSync(this.dbPath).filter(f => f.endsWith('.json'));
        return files.map(f => JSON.parse(fs.readFileSync(path.join(this.dbPath, f), 'utf8')));
    }

    exportCSV(outputPath) {
        const records = this.loadAll();
        const lines = ['deviceId,ip,city,country,os,browser,firstSeen,lastSeen,visits'];

        for (const r of records) {
            const p = r.profiles?.[0];
            const sf = p?.serverData || {};
            const bf = p?.profile?.browser || {};
            const osf = p?.profile?.os || {};

            lines.push([
                r.deviceId || 'unknown',
                sf.ip || '',
                sf.geo?.city || '',
                sf.geo?.country || '',
                osf.name || '',
                bf.userAgent?.split('/')[0] || '',
                new Date(r.firstSeen).toISOString(),
                new Date(r.lastSeen).toISOString(),
                r.visits || 1
            ].join(','));
        }

        fs.writeFileSync(outputPath, lines.join('\n'));
        console.log('Exported ' + records.length + ' records to ' + outputPath);
    }
}

module.exports = Correlator;