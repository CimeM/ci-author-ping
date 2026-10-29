async function sendNotification(target, routeConfig, fallbackContact, reason) {
  const core = await import('@actions/core');
  const { getInput } = core;
  const fetchModule = await import('node-fetch');
  const fetch = fetchModule.default ?? fetchModule;

  const destination = routeConfig?.slack_channel || routeConfig?.email || fallbackContact;
  
  const payload = {
    text: `🚨 *Pipeline Failure Alert*\n> *Reason:* ${reason}\n> *Blamed Author / Route:* *${target.name}* (${target.email})\n> *Dispatched To:* ${destination}`
  };

  console.log(`\n[Notifier] Dispatching notification...`);
  console.log(JSON.stringify(payload, null, 2));

  // Read the webhook from the action input (runner exposes it as INPUT_<NAME>)
  const webhookUrl = getInput('slack_webhook_url');
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
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

module.exports = { sendNotification };
