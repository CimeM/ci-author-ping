import * as core from '@actions/core';
import { loadRules } from './config.js';
import { resolveCulprit } from './git-parser.js';
import { sendNotification } from './notifier.js';

async function run() {
  try {
    const rulesFile = core.getInput('rules_file') || '.github/alert-config.yml';
    const fallbackContact = core.getInput('fallback_contact') || '#pipeline-alerts';
    
    const failedStep = process.env.FAILED_STEP_NAME || 'Unknown Step';
    const errorLogs = process.env.ERROR_LOGS || '';

    console.log(`[ci-author-ping] Analyzing failure for step: "${failedStep}"`);

    const config = loadRules(rulesFile);
    const culprit = resolveCulprit(null, failedStep, errorLogs);

    const slackUser = config.slack_user_map?.[culprit.name] || config.slack_user_map?.[culprit.email];

    await sendNotification(culprit, null, fallbackContact, failedStep, slackUser);
    
    console.log('[ci-author-ping] Routing complete.');
  } catch (error) {
    core.setFailed(`ci-author-ping execution failed: ${error.message}`);
  }
}

run();