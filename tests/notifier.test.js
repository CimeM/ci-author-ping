const { sendNotification } = require('../src/notifier');
const core = require('@actions/core');

// Mock external modules
jest.mock('@actions/core', () => ({
  getInput: jest.fn()
}));

describe('Notifier (src/notifier.js)', () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    // Mock global fetch for testing
    global.fetch = jest.fn();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    delete global.fetch;
  });

  it('should log a dry-run alert when no Slack webhook URL is configured', async () => {
    core.getInput.mockReturnValue(''); // No webhook URL provided

    const target = { name: 'Alice', email: 'alice@company.com' };
    await sendNotification(target, null, '#pipeline-alerts', 'Test Failure');

    expect(core.getInput).toHaveBeenCalledWith('slack_webhook_url');
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('(Dry-run mode: No SLACK_WEBHOOK_URL provided')
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should dispatch the alert payload to the Slack webhook when configured', async () => {
    core.getInput.mockReturnValue('https://hooks.slack.com/services/mock/webhook');
    global.fetch.mockResolvedValue({ ok: true });

    const target = { name: 'Bob', email: 'bob@company.com' };
    await sendNotification(target, null, '#pipeline-alerts', 'Docker Build Failure');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://hooks.slack.com/services/mock/webhook',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Successfully sent notification to Slack!')
    );
  });
});