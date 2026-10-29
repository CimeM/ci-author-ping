const { loadRules } = require('./config');
const { resolveCulprit } = require('./git-parser');
const { sendNotification } = require('./notifier');

async function run() {
  try {
    const core = await import('@actions/core');
    const { getInput, setFailed } = core;

    const rulesFile = getInput('rules_file') || '.github/blame-rules.yml';
    const fallbackContact = getInput('fallback_contact') || '#pipeline-alerts';
    
    // Read environment or action context
    const failedStepName = process.env.FAILED_STEP_NAME || 'Unknown Step';
    const errorLogs = process.env.ERROR_LOGS || '';

    console.log(`Analyzing failure for step: "${failedStepName}"...`);

    // Load rules engine configuration
    const config = loadRules(rulesFile);

    // Evaluate rules against failed step or error logs
    let matchedRule = null;
    if (config.rules) {
      for (const rule of config.rules) {
        if (rule.match_step && failedStepName.toLowerCase().includes(rule.match_step.toLowerCase())) {
          matchedRule = rule;
          break;
        }
        if (rule.match_error) {
          try {
            if (new RegExp(rule.match_error, 'i').test(errorLogs)) {
              matchedRule = rule;
              break;
            }
          } catch (regexError) {
            console.error(`Invalid regex in rule "${rule.name}":`, rule.match_error, regexError.message);
          }
        }
      }
    }

    // Determine target recipient via git blame or rule routing override
    let target;
    if (matchedRule && matchedRule.route_to && matchedRule.route_to.slack_channel && !matchedRule.route_to.mode) {
      // Static route rule (e.g., infrastructure error goes straight to devops channel)
      target = { name: `Team (${matchedRule.route_to.slack_channel})`, email: matchedRule.route_to.email || 'team@example.com' };
    } else {
      // Dynamic code author resolution
      target = resolveCulprit(matchedRule, failedStepName, errorLogs);
    }

    // Filter ignored bots (compare against both author name and email)
    const ignoredAuthors = config.ignore_authors || [];
    const isIgnored = ignoredAuthors.some(
      (author) => author === target.name || author === target.email
    );
    if (isIgnored) {
      console.log(`Blamed author ${target.name} is in ignore list. Falling back to default channel.`);
      target = { name: 'Fallback Team', email: fallbackContact };
    }

    // Dispatch the alert
    const reason = matchedRule ? matchedRule.name : 'Standard Pipeline Failure';
    await sendNotification(target, matchedRule?.route_to, fallbackContact, reason);

  } catch (error) {
    setFailed(`CI Blame Notifier failed with error: ${error.message}`);
  }
}

run();
