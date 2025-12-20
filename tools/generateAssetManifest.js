const fs = require("fs");
const path = require("path");

const ASSETS_DIR = path.resolve(__dirname, "../assets");
const MANIFEST_PATH = path.resolve(ASSETS_DIR, "manifest.json");

function scanDir(dir, basePath = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    let result = {};

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);

        if (entry.isDirectory()) {
            Object.assign(result, scanDir(fullPath, relativePath));
        } else {
            const key = relativePath.replace(/\\/g, "/");
            result[key] = `assets/${key}`;
        }
    }

    return result;
}

function generate() {
    const images = scanDir(path.join(ASSETS_DIR, "images"), "images");
    const sounds = scanDir(path.join(ASSETS_DIR, "sounds"), "sounds");

    const manifest = {
        images,
        sounds,
    };

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

}

generate();
