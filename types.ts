export interface ValidationOptions {
  checkGostOV: boolean;
  checkGostVK: boolean;
  checkGostEOM: boolean;
  checkSPDS: boolean;
  checkSpelling: boolean;
  checkStamps: boolean;
  checkCipher: boolean;
}

export interface Issue {
  type: 'error' | 'warning';
  section: string;
  sheet: string;
  location: string;
  description: string;
  reference: string;
}

export interface AnalysisSummary {
  total_checks: number;
  errors: number;
  warnings: number;
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  issues: Issue[];
}

export interface FileWithPreview extends File {
  preview?: string;
}
