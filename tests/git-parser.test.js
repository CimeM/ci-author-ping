import { execSync } from 'child_process';
import { resolveCulprit } from '../src/git-parser';

jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('Git Parser (src/git-parser.js)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should parse author name and email correctly from standard git log output', () => {
    execSync.mockReturnValue('Jane Doe|jane@company.com\n');

    const author = resolveCulprit(null, 'Standard Step', '');

    expect(author).toEqual({
      name: 'Jane Doe',
      email: 'jane@company.com'
    });
  });

  it('should respect source file overrides when a rule specifies blame_source_files', () => {
    execSync.mockReturnValue('John Smith|john@company.com\n');

    const rule = {
      name: 'Docker Override Rule',
      blame_source_files: ['package.json', 'src/index.js']
    };

    const author = resolveCulprit(rule, 'Build Docker Image', '');

    expect(author).toEqual({
      name: 'John Smith',
      email: 'john@company.com'
    });
  });

  it('should return fallback author details gracefully if git commands throw an error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    execSync.mockImplementation(() => {
      throw new Error('git command failed');
    });

    const author = resolveCulprit(null, 'Failing Step', '');

    expect(author).toEqual({
      name: 'Unknown Author',
      email: 'unknown@example.com'
    });
    consoleErrorSpy.mockRestore();
  });
});