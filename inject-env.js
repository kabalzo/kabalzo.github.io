// inject-env.js - Injects environment variables into your site
// This runs during Netlify's build process

const fs = require('fs');
const path = require('path');

console.log('🔧 Injecting environment variables...');

// Get the OMDB API key from environment
const omdbApiKey = process.env.OMDB_API_KEY;

if (!omdbApiKey) {
    console.error('❌ OMDB_API_KEY environment variable not found!');
    console.log('Make sure to set it in Netlify Site Settings → Environment Variables');
    process.exit(1);
}

// Create a config.json file with the API key
const config = {
    omdbApiKey: omdbApiKey
};

try {
    fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
    console.log('✅ config.json created with API key');
} catch (error) {
    console.error('❌ Failed to create config.json:', error);
    process.exit(1);
}

// Also create an env.js file that can be included in HTML
const envJs = `
// Auto-generated environment variables
window.ENV = {
    OMDB_API_KEY: "${omdbApiKey}"
};
console.log('Environment variables loaded');
`;

try {
    fs.writeFileSync('env.js', envJs);
    console.log('✅ env.js created');
} catch (error) {
    console.error('❌ Failed to create env.js:', error);
    process.exit(1);
}

console.log('🎉 Build complete! Environment variables injected successfully.');
console.log('📁 Files created:');
console.log('   - config.json (for fetch API calls)');
console.log('   - env.js (for direct script inclusion)');

// Verify the files were created correctly
if (fs.existsSync('config.json') && fs.existsSync('env.js')) {
    console.log('✅ All files verified');
} else {
    console.error('❌ File verification failed');
    process.exit(1);
}