import * as core from '@actions/core';
import { loadRules } from './config.js';
import { resolveCulprit } from './git-parser.js';
import { sendNotification } from './notifier.js';

async function run() {
  try {
    const rulesFile = core.getInput('rules_file') || '.github/blame-rules.yml';
    const fallbackContact = core.getInput('fallback_contact') || '#pipeline-alerts';
    
    const failedStep = process.env.FAILED_STEP_NAME || 'Unknown Step';
    const errorLogs = process.env.ERROR_LOGS || '';

    console.log(`[AuthorPing] Analyzing failure for step: "${failedStep}"`);

    const config = loadRules(rulesFile);
    const culprit = resolveCulprit(null, failedStep, errorLogs);

    await sendNotification(culprit, null, fallbackContact, failedStep);
    
    console.log('[AuthorPing] Routing complete.');
  } catch (error) {
    core.setFailed(`AuthorPing execution failed: ${error.message}`);
  }
}

run();