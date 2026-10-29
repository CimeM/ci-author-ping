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

  it('should fall through to the next blame source file when one cannot be resolved', () => {
    execSync.mockImplementation((cmd) => {
      // Fail only for the first pattern, succeed for the second
      if (cmd.includes('missing-file.json')) {
        throw new Error('file not found');
      }
      return 'Carol Coder|carol@company.com\n';
    });

    const rule = {
      name: 'Docker Rule',
      blame_source_files: ['missing-file.json', 'src/index.js']
    };

    const author = resolveCulprit(rule, 'Build Docker Image', '');

    expect(author).toEqual({
      name: 'Carol Coder',
      email: 'carol@company.com'
    });
  });

  it('should return a consistent unknown-author sentinel when the git command fails', () => {
    execSync.mockImplementation(() => {
      throw new Error('not a git repository');
    });

    const author = resolveCulprit(null, 'Standard Step', '');

    expect(author.name).toBe('Unknown Author');
  });
});
