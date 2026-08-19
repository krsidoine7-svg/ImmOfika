const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/HomepageConfigClient.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove from DEFAULTS
// Match the end of background_image to the end of video_values array
const defaultsRegex = /,\s*video_url:\s*"[^"]*",\s*video_fallback_image:\s*"[^"]*",(\s*background_image:\s*"[^"]*",)\s*video_title:[\s\S]*?\]/g;
content = content.replace(defaultsRegex, '$1'); 

// Let's refine the defaults removal since background_image is before or after video_fallback_image
const preciseDefaultsRegex = /\s*video_url:\s*".*?",\s*video_fallback_image:\s*".*?",\s*background_image:\s*".*?",\s*video_title:\s*".*?",\s*video_subtitle:\s*".*?",\s*video_values:\s*\[[\s\S]*?\]/g;
content = content.replace(preciseDefaultsRegex, '\n    background_image: "/heros-img.png"');

// 2. Remove the JSX section for Video Portals
const jsxRegex = /\{\/\*\s*Video Portals\s*\*\/\}([\s\S]*?)<\/CardContent>/;
content = content.replace(jsxRegex, '</CardContent>');

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Modifications applied successfully.");
