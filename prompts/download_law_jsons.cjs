const fs = require('fs');
const path = require('path');
const https = require('https');
const jsonFile = path.join(__dirname, 'listTreeLawWebCategoryByParam-response.json');
const outputDir = path.join(__dirname, '../law_jsons');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function downloadFile(url, dest, cb) {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            cb(new Error(`Failed to get '${url}' (${response.statusCode})`));
            return;
        }
        response.pipe(file);
        file.on('finish', () => {
            file.close(cb);
        });
    }).on('error', (err) => {
        fs.unlink(dest, () => cb(err));
    });
}

function findJsonUrls(obj, results = []) {
    if (obj && typeof obj === 'object') {
        if (obj.jsonUrl && obj.id) {
            results.push({ url: obj.jsonUrl, id: obj.id });
        }
        for (const key in obj) {
            findJsonUrls(obj[key], results);
        }
    }
    return results;
}

function main() {
    ensureDir(outputDir);
    const raw = fs.readFileSync(jsonFile, 'utf-8');
    const data = JSON.parse(raw);
    const urls = findJsonUrls(data);
    let count = 0;
    function next() {
        if (count >= urls.length) {
            console.log('All files downloaded.');
            return;
        }
        const { url, id } = urls[count];
        const dest = path.join(outputDir, `${id}.json`);
        console.log(`Downloading ${url} -> ${dest}`);
        downloadFile(url, dest, (err) => {
            if (err) {
                console.error(`Error downloading ${url}:`, err);
            }
            count++;
            setTimeout(next, 100); // avoid too many requests at once
        });
    }
    next();
}

if (require.main === module) {
    main();
}
