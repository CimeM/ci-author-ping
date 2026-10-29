const { execSync } = require('child_process');
const { resolveCulprit } = require('../src/git-parser');

// Mock child_process.execSync to prevent actual shell execution
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('Git Parser (src/git-parser.js)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should parse author name and email correctly from git log output', () => {
    execSync.mockReturnValue('Alice Developer|alice@company.com\n');

    const author = resolveCulprit(null, 'Standard Step', '');

    expect(author).toEqual({
      name: 'Alice Developer',
      email: 'alice@company.com'
    });
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('git log'),
      expect.any(Object)
    );
  });

  it('should respect source file overrides when a rule specifies blame_source_files', () => {
    execSync.mockReturnValue('Bob Configurator|bob@company.com\n');

    const rule = {
      name: 'Docker Rule',
      blame_source_files: ['package.json', 'src/index.js']
    };

    const author = resolveCulprit(rule, 'Build Docker Image', '');

    expect(author).toEqual({
      name: 'Bob Configurator',
      email: 'bob@company.com'
    });
    // Verifies that it targeted the override file instead of root '.'
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.any(Object)
    );
  });
});
