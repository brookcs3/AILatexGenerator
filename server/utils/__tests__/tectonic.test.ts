import { parseErrorLog } from '../tectonic';

describe('parseErrorLog', () => {
  test('parses message on the next line', () => {
    const log = [
      'l.12 \\beign',
      'Undefined control sequence'
    ].join('\n');
    const result = parseErrorLog(log);
    expect(result).toEqual([
      {
        line: 12,
        message: 'l.12 \\beign Undefined control sequence'
      }
    ]);
  });

  test('parses message on the same line', () => {
    const log = 'l.34 Missing $ inserted';
    const result = parseErrorLog(log);
    expect(result).toEqual([
      {
        line: 34,
        message: 'l.34 Missing $ inserted'
      }
    ]);
  });

  test('parses multiple errors', () => {
    const log = [
      'l.3 \\foo',
      'Undefined control sequence',
      'some other info',
      'l.20 Missing $ inserted'
    ].join('\n');
    const result = parseErrorLog(log);
    expect(result).toEqual([
      {
        line: 3,
        message: 'l.3 \\foo Undefined control sequence'
      },
      {
        line: 20,
        message: 'l.20 Missing $ inserted'
      }
    ]);
  });
});
