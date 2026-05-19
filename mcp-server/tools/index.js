import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//get all the tool plugins, the files with the specified format are allowed to be loaded
export async function loadAllPlugins() {
  const pluginsDir = path.join(__dirname, 'plugins');
  const pluginFiles = fs.readdirSync(pluginsDir).filter(file => 
    file.endsWith('.plugin.js') && !file.startsWith('_template')
  );
  
  const plugins = [];
  //getting the required plugin, displaying its name, its category
  for (const file of pluginFiles) {
    const filePath = path.join(pluginsDir, file);
    const plugin = await import(`file://${filePath}`);
    plugins.push(plugin.default);
    console.log(`  📦 Loaded plugin: ${plugin.default.name} (${plugin.default.category})`);
  }
  
  return plugins;
}
//getting the list of all tools under the given category
export function getToolsByCategory(plugins, category) {
  return plugins.filter(p => p.category === category);
}
// getting the list of all unique categories available and defined
export function getAllCategories(plugins) {
  return [...new Set(plugins.map(p => p.category))];
}