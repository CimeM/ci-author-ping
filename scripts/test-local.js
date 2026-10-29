// Local test harness
process.env.FAILED_STEP_NAME = "Build Docker Image";
process.env.ERROR_LOGS = "Step failed during docker build layer compilation";
process.env.INPUT_RULES_FILE = ".github/blame-rules.yml";
process.env.INPUT_FALLBACK_CONTACT = "#devops-escalations";

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

  await sendNotification( culprit, rule?.route_to, process.env.INPUT_FALLBACK_CONTACT, rule ? rule.name : 'General Failure' );
  console.log("=== Test Complete ===");
}

testLocal();
