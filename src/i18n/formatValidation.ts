import type { RoundValidationIssue } from '../domain/scoring';

type TFn = (key: string, params?: Record<string, string | number>) => string;

export function formatValidationIssues(issues: RoundValidationIssue[], t: TFn): string[] {
  return issues.map((issue) => {
    switch (issue.code) {
      case 'missing_bid':
        return t('validation.missing_bid');
      case 'missing_tricks':
        return t('validation.missing_tricks');
      case 'total_exceeds':
        return t('validation.total_exceeds', { round: issue.round, total: issue.total });
      case 'total_must_equal':
        return t('validation.total_must_equal', { round: issue.round, total: issue.total });
      default:
        return '';
    }
  });
}
