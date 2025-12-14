import React from 'react';
import { ValidationOptions } from '../types';

interface OptionsSelectorProps {
  options: ValidationOptions;
  setOptions: React.Dispatch<React.SetStateAction<ValidationOptions>>;
}

const OptionsSelector: React.FC<OptionsSelectorProps> = ({ options, setOptions }) => {
  const handleChange = (key: keyof ValidationOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checkboxItem = (key: keyof ValidationOptions, label: string) => (
    <div className="relative flex items-start py-2">
      <div className="min-w-0 flex-1 text-sm">
        <label htmlFor={`option-${key}`} className="font-medium text-gray-700 select-none cursor-pointer">
          {label}
        </label>
      </div>
      <div className="ml-3 flex items-center h-5">
        <input
          id={`option-${key}`}
          name={`option-${key}`}
          type="checkbox"
          checked={options[key]}
          onChange={() => handleChange(key)}
          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4 border-b pb-2">Протокол проверки</h3>
      <div className="divide-y divide-gray-100">
        {checkboxItem('checkGostOV', 'ГОСТ 21.602-2016 (Отопление, вентиляция / ОВ)')}
        {checkboxItem('checkGostVK', 'ГОСТ 21.704-2011 (Водоснабжение и канализация / ВК)')}
        {checkboxItem('checkGostEOM', 'ГОСТ 21.613-2014 (Силовое электрооборудование / ЭОМ)')}
        {checkboxItem('checkSPDS', 'СПДС (ГОСТ Р 21.101-2020)')}
        {checkboxItem('checkSpelling', 'Орфография и опечатки')}
        {checkboxItem('checkStamps', 'Заполнение штампов и основных надписей')}
        {checkboxItem('checkCipher', 'Соответствие шифра проекта')}
      </div>
    </div>
  );
};

export default OptionsSelector;
