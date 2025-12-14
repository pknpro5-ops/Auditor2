import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import OptionsSelector from './components/OptionsSelector';
import ResultsDisplay from './components/ResultsDisplay';
import { ValidationOptions, AnalysisResult } from './types';
import { analyzeDocuments } from './services/geminiService';

const App: React.FC = () => {
  // State for Inputs
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [gostFiles, setGostFiles] = useState<File[]>([]);
  const [instructions, setInstructions] = useState<string>('');
  const [projectCipher, setProjectCipher] = useState<string>('');
  
  // State for Config
  const [options, setOptions] = useState<ValidationOptions>({
    checkGostOV: true,
    checkGostVK: true,
    checkGostEOM: true,
    checkSPDS: true,
    checkSpelling: true,
    checkStamps: true,
    checkCipher: true,
  });

  // State for Processing
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProjectFileChange = (files: File[]) => {
    if (files.length > 0) setProjectFile(files[0]);
    else setProjectFile(null);
  };

  const handleAnalyze = async () => {
    if (!projectFile) {
      setError("Пожалуйста, загрузите PDF файл проекта для анализа.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeDocuments(
        projectFile,
        gostFiles,
        instructions,
        projectCipher,
        options
      );
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Произошла непредвиденная ошибка во время анализа.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 rounded p-1.5">
               <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">EngDoc Auditor AI</h1>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden md:flex items-center space-x-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>База ГОСТ: Подключена</span>
             </div>
             <div className="text-sm text-gray-500">
                Powered by Gemini 1.5 Pro
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration & Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Project Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Данные проекта</h2>
              <div className="space-y-4">
                <FileUploader 
                  label="Проектная документация (PDF)" 
                  files={projectFile ? [projectFile] : []}
                  onFilesChange={handleProjectFileChange}
                  accept=".pdf"
                  helperText="Загрузите основной комплект чертежей (ОВ, ВК или ЭОМ)"
                />
                
                <div>
                  <label htmlFor="cipher" className="block text-sm font-medium text-gray-700">Шифр проекта (Эталон)</label>
                  <input
                    type="text"
                    id="cipher"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="напр., 2024-AB-123-OV"
                    value={projectCipher}
                    onChange={(e) => setProjectCipher(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 2. Standards & Instructions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Стандарты и инструкции</h2>
              <div className="space-y-4">
                <FileUploader 
                  label="Дополнительные ГОСТы (PDF)" 
                  files={gostFiles}
                  onFilesChange={setGostFiles}
                  accept=".pdf"
                  multiple={true}
                  helperText="Необязательно. Основные ГОСТы (ОВ, ВК, ЭОМ, СПДС) уже в базе."
                />

                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Особые инструкции</label>
                  <textarea
                    id="instructions"
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="Напр., проверить даты в штампах за Февраль 2024. Сверить заголовки в Таблице 2."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 3. Options */}
            <OptionsSelector options={options} setOptions={setOptions} />

            {/* Action Button */}
            <div className="pt-2 sticky bottom-4 z-20">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !projectFile}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                  (isLoading || !projectFile) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Выполняется аудит...' : 'Начать аудит'}
              </button>
              {error && (
                <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm border border-red-200">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
             <div className="bg-white shadow rounded-lg p-6 h-full min-h-[500px] flex flex-col">
                <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
                   <h2 className="text-2xl font-bold text-gray-900">Отчет аудита</h2>
                   {result && (
                     <button 
                       onClick={() => window.print()}
                       className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                     >
                       <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                       </svg>
                       Печать
                     </button>
                   )}
                </div>
                <ResultsDisplay result={result} isLoading={isLoading} />
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
