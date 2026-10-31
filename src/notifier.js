import * as core from '@actions/core';

function getOptionalEnv(name, fallback = '') {
  const value = process.env[name];
  const trimmed = value ? value.trim() : '';
  return trimmed || fallback;
}

function buildRunUrl() {
  const runId = getOptionalEnv('GITHUB_RUN_ID');
  if (!runId) return '';
  const serverUrl = getOptionalEnv('GITHUB_SERVER_URL', 'https://github.com');
  const repo = getOptionalEnv('GITHUB_REPOSITORY');
  const repoPart = repo ? `${repo}/` : '';
  return `${serverUrl}/${repoPart}actions/runs/${runId}`;
}

export async function sendNotification(target, routeConfig, fallbackContact, reason, slackUser) {
  const destination = slackUser || routeConfig?.slack_channel || routeConfig?.email || fallbackContact;
  
  const pipelineName = getOptionalEnv('GITHUB_PIPELINE_NAME') || getOptionalEnv('GITHUB_WORKFLOW');
  const actionName = getOptionalEnv('FAILED_STEP_NAME');
  const runUrl = buildRunUrl();

  const lines = ['🚨 *Pipeline Failure Alert*'];
  if (pipelineName) lines.push(`> *Pipeline:* ${pipelineName}`);
  if (actionName) lines.push(`> *Action:* ${actionName}`);
  lines.push(`> *Reason:* ${reason}`);
  lines.push(`> *Blamed Author / Route:* *${target.name}* (${target.email})`);
  lines.push(`> *Dispatched To:* ${slackUser ? `<@${slackUser}>` : destination}`);

  const text = runUrl ? [...lines, `> *Failed Run:* ${runUrl}`].join('\n') : lines.join('\n');
  const payload = { text };

  console.log(`\n[Notifier] Dispatching notification...`);
  console.log(JSON.stringify(payload, null, 2));

  const webhookUrl = core.getInput('slack_webhook_url');
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Slack API error: ${response.statusText}`);
      console.log('[Notifier] Successfully sent notification to Slack!');
    } catch (err) {
      console.error('[Notifier] Failed to send Slack notification:', err.message);
    }
  } else {
    console.log('[Notifier] (Dry-run mode: No SLACK_WEBHOOK_URL provided, alert printed to console only)');
  }
}
