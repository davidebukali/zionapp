import { buildPrefilledFeedbackUrl } from './feedback';

describe('buildPrefilledFeedbackUrl', () => {
  const BASE_URL =
    'https://docs.google.com/forms/d/e/1FAIpQLSfy89QGSk5n0BhfVNm9SmI3ej86Nzp58mDOFdHirtQqZEhIwA/viewform';

  it('builds URL with all prefilled parameters encoded', () => {
    const url = buildPrefilledFeedbackUrl(BASE_URL, {
      deviceLabel: 'Android (Pixel 7 - OS 14)',
      appVersion: '1.0.0 (1)',
      username: 'devserene',
    });

    expect(url).toContain('usp=pp_url');
    expect(url).toContain(
      'entry.1171582430=Android%20(Pixel%207%20-%20OS%2014)'
    );
    expect(url).toContain('entry.1534061409=1.0.0%20(1)');
    expect(url).toContain('entry.1086525665=devserene');
  });

  it('strips existing query params from baseUrl before appending', () => {
    const urlWithParams = `${BASE_URL}?usp=header&extra=123`;
    const url = buildPrefilledFeedbackUrl(urlWithParams, {
      username: 'tester',
    });

    expect(url.startsWith(BASE_URL)).toBe(true);
    expect(url).not.toContain('usp=header');
    expect(url).not.toContain('extra=123');
    expect(url).toContain('usp=pp_url');
    expect(url).toContain('entry.1086525665=tester');
  });

  it('handles empty or omitted parameters gracefully', () => {
    const url = buildPrefilledFeedbackUrl(BASE_URL, {});
    expect(url).toBe(`${BASE_URL}?usp=pp_url`);
  });
});

