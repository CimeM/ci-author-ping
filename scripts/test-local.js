// Local test harness
process.env.FAILED_STEP_NAME = process.env.FAILED_STEP_NAME || "Build Docker Image";
process.env.ERROR_LOGS = process.env.ERROR_LOGS || "Step failed during docker build layer compilation";
process.env.INPUT_RULES_FILE = process.env.INPUT_RULES_FILE || ".github/blame-rules.yml";
process.env.INPUT_FALLBACK_CONTACT = process.env.INPUT_FALLBACK_CONTACT || "#devops-escalations";

// Mock core functions if running standalone
const { loadRules } = require('../src/config');
const { resolveCulprit } = require('../src/git-parser');
const { sendNotification } = require('../src/notifier');

async function testLocal() {
  console.log("=== Running AuthorPing Local Test ===");
  const config = loadRules('.github/blame-rules.yml');
  
  const failedStep = process.env.FAILED_STEP_NAME;
  console.log(`Simulated Failed Step: ${failedStep}`);

  // Find rule match
  const rule = config.rules?.find(r => r.match_step && failedStep.includes(r.match_step));
  
  const culprit = resolveCulprit(rule, failedStep, process.env.ERROR_LOGS);
  console.log(`Resolved Target:`, culprit);

  // Mirror the ignore_authors handling from src/index.js
  if (config.ignore_authors && config.ignore_authors.includes(culprit.name)) {
    console.log(`Blamed author ${culprit.name} is in ignore list. Falling back to default channel.`);
    culprit.name = 'Fallback Team';
    culprit.email = process.env.INPUT_FALLBACK_CONTACT || '#pipeline-alerts';
  }

  await sendNotification( culprit, rule?.route_to, process.env.INPUT_FALLBACK_CONTACT || '#pipeline-alerts', rule ? rule.name : 'General Failure' );
  console.log("=== Test Complete ===");
}

testLocal();
