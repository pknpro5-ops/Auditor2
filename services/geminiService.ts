import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AnalysisResult, ValidationOptions } from "../types";

const fileToPart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        total_checks: { type: Type.INTEGER },
        errors: { type: Type.INTEGER },
        warnings: { type: Type.INTEGER },
      },
      required: ["total_checks", "errors", "warnings"],
    },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["error", "warning"] },
          section: { type: Type.STRING },
          sheet: { type: Type.STRING },
          location: { type: Type.STRING },
          description: { type: Type.STRING },
          reference: { type: Type.STRING },
        },
        required: ["type", "section", "sheet", "location", "description", "reference"],
      },
    },
  },
  required: ["summary", "issues"],
};

export const analyzeDocuments = async (
  projectFile: File,
  gostFiles: File[],
  instructions: string,
  projectCipher: string,
  options: ValidationOptions
): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare file parts
  const projectPart = await fileToPart(projectFile);
  const gostParts = await Promise.all(gostFiles.map((file) => fileToPart(file)));

  // Construct the prompt based on enabled options
  const activeChecks = Object.entries(options)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key)
    .join(", ");

  const promptText = `
    Роль: Вы профессиональный эксперт по нормоконтролю проектной документации инженерных систем (ОВ, ВК, ЭОМ).
    
    Задача: Проанализировать предоставленный PDF-файл проекта на соответствие стандартам ГОСТ и инструкциям пользователя.
    
    Входные данные:
    1. Первый файл — ПРОЕКТНАЯ ДОКУМЕНТАЦИЯ (PDF) для проверки.
    2. Последующие файлы (если есть) — файлы стандартов ГОСТ (PDF). Если файлы ГОСТ не предоставлены, используйте вашу ВНУТРЕННЮЮ БАЗУ ЗНАНИЙ актуальных стандартов РФ.
    3. Шифр проекта (Эталон): "${projectCipher}"
    4. Инструкции пользователя: "${instructions}"
    
    Включенные опции проверки (выполнять только эти проверки):
    ${activeChecks}
    
    Детали опций:
    - checkGostOV: Проверка по ГОСТ 21.602-2016 (Отопление, вентиляция и кондиционирование).
    - checkGostVK: Проверка по ГОСТ 21.704-2011 (Водоснабжение и канализация).
    - checkGostEOM: Проверка по ГОСТ 21.613-2014 (Силовое электрооборудование).
    - checkSPDS: Проверка по ГОСТ Р 21.101-2020 (СПДС. Основные требования к проектной и рабочей документации). Проверять оформление, основные надписи, обозначения, линии, шрифты.
    - checkSpelling: Проверка орфографии и опечаток в текстовых блоках.
    - checkStamps: Проверка заполнения основной надписи (штампа): наличие дат, подписей, стадий, наименований.
    - checkCipher: Сравнение шифра в штампе с эталонным "${projectCipher}".

    Логика работы:
    1. АВТОМАТИЧЕСКИ ОПРЕДЕЛИТЬ тип проекта (ОВ, ВК или ЭОМ) на основе содержимого, если явно не указано иное.
    2. Если файлы ГОСТ не загружены пользователем, использовать знания из ВНУТРЕННЕЙ БАЗЫ ЗНАНИЙ для соответствующего раздела (ОВ/ВК/ЭОМ) и СПДС.
    3. Проанализировать структуру PDF (Титульный лист, Чертежи, Штампы, Таблицы).
    4. Для каждого найденного несоответствия:
       - Определить точный Номер Листа.
       - Указать зону (Штамп, Таблица, Текст, Схема).
       - Четко описать суть ошибки на РУССКОМ ЯЗЫКЕ.
       - Указать ссылку на пункт ГОСТ или инструкцию.
    5. Вывод должен быть строго в формате JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        role: "user",
        parts: [
          { text: promptText },
          projectPart,
          ...gostParts,
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: { thinkingBudget: 4096 },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Не удалось получить ответ от Gemini.");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
