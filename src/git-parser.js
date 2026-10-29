const { execSync } = require('child_process');

function getAuthorForPath(targetPath) {
  try {
    // Fallback to '.' if path doesn't exist
    const searchPath = targetPath || '.';
    // Run git log to find the last author who touched this path
    const cmd = `git log -n 1 --pretty=format:"%an|%ae" -- "${searchPath}"`;
    const result = execSync(cmd, { encoding: 'utf8' }).trim();
    
    if (!result) return { name: 'Unknown Author', email: 'unknown@example.com' };

    const [name, email] = result.split('|');
    return { name, email };
  } catch (error) {
    console.error(`Git command failed for path ${targetPath}:`, error.message);
    return { name: 'System / Unknown', email: 'fallback@example.com' };
  }
}

function resolveCulprit(rule, failedStepName, errorLogs) {
  // If rule specifies custom blame source files (e.g., package.json for a Docker build failure)
  if (rule && rule.blame_source_files && rule.blame_source_files.length > 0) {
    console.log(`[BlameEngine] Rule matched. Overriding blame target to source files:`, rule.blame_source_files);
    // Check the first matching file that exists
    for (const filePattern of rule.blame_source_files) {
      const author = getAuthorForPath(filePattern);
      if (author.name !== 'Unknown Author') {
        return author;
      }
    }
  }

  // Default behavior: Blame the general workspace or last commit
  return getAuthorForPath('.');
}

module.exports = { resolveCulprit };
