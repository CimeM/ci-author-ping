const { sendNotification } = require('../src/notifier');
const fetch = require('node-fetch');

// Mock the fetch module so tests don't hit the network
jest.mock('node-fetch', () => jest.fn());

describe('Notifier (src/notifier.js)', () => {
  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.SLACK_WEBHOOK_URL;
  });

  it('should log a dry-run alert when no Slack webhook URL is configured', async () => {
    delete process.env.SLACK_WEBHOOK_URL;

    await sendNotification(
      { name: 'Jane Dev', email: 'jane@company.com' },
      { slack_channel: '#dev-team' },
      '#pipeline-alerts',
      'Docker Build Failure Tracking'
    );

    expect(fetch).not.toHaveBeenCalled();
  });

  it('should dispatch the alert payload to the Slack webhook when configured', async () => {
    process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T000/B000/XXXX';
    fetch.mockResolvedValue({ ok: true });

    await sendNotification(
      { name: 'Jane Dev', email: 'jane@company.com' },
      { slack_channel: '#dev-team' },
      '#pipeline-alerts',
      'Docker Build Failure Tracking'
    );

    expect(fetch).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/T000/B000/XXXX',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
