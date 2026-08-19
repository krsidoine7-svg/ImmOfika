const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/admin/HomepageConfigClient.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Remove from DEFAULTS
const teamDefaultRegex = /team:\s*\{\s*enabled:\s*true,\s*theme:\s*"white",\s*tag:\s*"Notre Équipe",\s*title:\s*"Les experts à votre service.",\s*italic_word:\s*"service",\s*description:\s*"Une équipe passionnée et dévouée pour faire de votre projet immobilier une réussite totale.",\s*members:\s*\[\]\s*\},/g;
content = content.replace(teamDefaultRegex, '');

// 2. Remove TabsTrigger
const tabsTriggerRegex = /<TabsTrigger\s+value="team"[^>]*>[\s\S]*?Notre Équipe[\s\S]*?<\/TabsTrigger>\s*/g;
content = content.replace(tabsTriggerRegex, '');

// 3. Remove TabsContent
const tabsContentRegex = /\/\*\s*TEAM TAB\s*\*\/[\s\S]*?<TabsContent\s+value="team">[\s\S]*?(?=\/\*\s*TESTIMONIALS TAB\s*\*\/)/g;
content = content.replace(tabsContentRegex, '');

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Modifications applied successfully.");
