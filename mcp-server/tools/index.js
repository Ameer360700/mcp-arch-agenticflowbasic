import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadAllPlugins() {
  const pluginsDir = path.join(__dirname, 'plugins');
  const pluginFiles = fs.readdirSync(pluginsDir).filter(file => 
    file.endsWith('.plugin.js') && !file.startsWith('_template')
  );
  
  const plugins = [];
  
  for (const file of pluginFiles) {
    const filePath = path.join(pluginsDir, file);
    const plugin = await import(`file://${filePath}`);
    plugins.push(plugin.default);
    console.log(`  📦 Loaded plugin: ${plugin.default.name} (${plugin.default.category})`);
  }
  
  return plugins;
}

export function getToolsByCategory(plugins, category) {
  return plugins.filter(p => p.category === category);
}

export function getAllCategories(plugins) {
  return [...new Set(plugins.map(p => p.category))];
}