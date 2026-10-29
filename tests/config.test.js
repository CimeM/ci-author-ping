const fs = require('fs');
const { loadRules } = require('../src/config');

jest.mock('fs');

describe('Config Loader (src/config.js)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully load and parse a valid rules YAML file', () => {
    const mockYaml = `
default_fallback_channel: "#custom-alerts"
ignore_authors:
  - "bot"
rules:
  - name: "Docker Build Failure"
    match_step: "Build"
    `;

    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(mockYaml);

    const config = loadRules('.github/blame-rules.yml');
    
    expect(config.default_fallback_channel).toBe('#custom-alerts');
    expect(config.ignore_authors).toContain('bot');
    expect(config.rules.length).toBe(1);
    expect(config.rules[0].name).toBe('Docker Build Failure');
  });

  it('should return default fallback config if rules file does not exist', () => {
    fs.existsSync.mockReturnValue(false);

    const config = loadRules('non-existent-file.yml');

    expect(config.default_fallback_channel).toBe('#pipeline-alerts');
    expect(config.rules).toEqual([]);
  });

  it('should return safe defaults if the rules file is empty', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('INVALID: [yaml: content');

    const config = loadRules('.github/blame-rules.yml');

    expect(config.rules).toEqual([]);
    consoleErrorSpy.mockRestore();
  });
});