import React from 'react';
import { AnalysisResult, Issue } from '../types';

interface ResultsDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-800">Анализ документации...</h3>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          Gemini проверяет чертежи на соответствие ГОСТ и СПДС. Это может занять некоторое время из-за сложности документов.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-lg shadow-sm border border-gray-200 border-dashed p-8">
        <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-500 font-medium">Результаты анализа отсутствуют.</p>
        <p className="text-gray-400 text-sm mt-1">Загрузите файлы и нажмите «Начать аудит».</p>
      </div>
    );
  }

  const { summary, issues } = result;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Всего проверок</p>
          <p className="mt-1 text-3xl font-bold text-blue-900">{summary.total_checks}</p>
        </div>
        <div className="bg-red-50 border border-red-100 p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-red-600 uppercase tracking-wider">Ошибки</p>
          <p className="mt-1 text-3xl font-bold text-red-900">{summary.errors}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg shadow-sm">
          <p className="text-sm font-medium text-yellow-600 uppercase tracking-wider">Предупреждения</p>
          <p className="mt-1 text-3xl font-bold text-yellow-900">{summary.warnings}</p>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Журнал аудита</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {issues.length} записей
          </span>
        </div>
        <ul className="divide-y divide-gray-200">
          {issues.length === 0 ? (
             <li className="px-6 py-12 text-center text-gray-500">
               Замечаний не выявлено. Документация соответствует выбранным критериям проверки.
             </li>
          ) : (
            issues.map((issue, index) => (
              <li key={index} className="hover:bg-gray-50 transition-colors p-6">
                <div className="flex items-start space-x-4">
                  {/* Icon based on Type */}
                  <div className="flex-shrink-0 mt-1">
                    {issue.type === 'error' ? (
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-100">
                         <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                         </svg>
                      </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${
                           issue.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                         }`}>
                           {issue.type === 'error' ? 'Ошибка' : 'Предупреждение'}
                         </span>
                         <span className="text-sm font-semibold text-gray-900">
                           {issue.section} — {issue.sheet}
                         </span>
                      </div>
                      <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                        {issue.location}
                      </span>
                    </div>
                    
                    <p className="text-gray-800 mt-2 mb-2">{issue.description}</p>
                    
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Ссылка: <span className="font-medium text-gray-700 ml-1">{issue.reference}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ResultsDisplay;
