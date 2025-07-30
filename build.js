// build.js
const fs = require('fs');

console.log('🔧 Building site with environment variables...');

const apiKey = process.env.OMDB_API_KEY;

if (!apiKey) {
    console.error('❌ OMDB_API_KEY not found');
    process.exit(1);
}

// Create config.json
const config = { omdbApiKey: apiKey };
fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
console.log('✅ config.json created');

// Create env.js 
const envJs = `window.ENV = { OMDB_API_KEY: "${apiKey}" };`;
fs.writeFileSync('env.js', envJs);
console.log('✅ env.js created');