const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function loadRules(configPath) {
  const resolvedPath = path.resolve(process.cwd(), configPath);
  if (!fs.existsSync(resolvedPath)) {
    // Return default empty rules if config doesn't exist yet
    return {
      default_fallback_channel: '#pipeline-alerts',
      ignore_authors: ['dependabot[bot]', 'github-actions[bot]'],
      rules: []
    };
  }
  try {
    const fileContents = fs.readFileSync(resolvedPath, 'utf8');
    return yaml.load(fileContents);
  } catch (e) {
    console.error(`Error parsing rules file at ${resolvedPath}:`, e.message);
    return { rules: [] };
  }
}

module.exports = { loadRules };
