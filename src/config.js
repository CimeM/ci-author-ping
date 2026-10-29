const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

export function loadRules(configPath) {
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
    const parsed = yaml.load(fileContents);
    // An empty YAML file parses to null; fall back to safe defaults
    if (!parsed || typeof parsed !== 'object') {
      return { rules: [] };
    }
    return parsed;
  } catch (e) {
    console.error(`Error parsing rules file at ${resolvedPath}:`, e.message);
    return { default_fallback_channel: '#pipeline-alerts', ignore_authors: ['dependabot[bot]', 'github-actions[bot]'], rules: [] };
  }
}
