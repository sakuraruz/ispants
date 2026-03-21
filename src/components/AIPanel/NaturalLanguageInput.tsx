import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface NaturalLanguageInputProps {
  onSubmit: (query: string) => Promise<void>;
  isLoading?: boolean;
  suggestions?: string[];
}

const exampleQueries = [
  "Покажи сумму сделок по месяцам",
  "Средняя сумма продаж по регионам",
  "Количество сделок в Москве за последний квартал",
  "Топ-10 менеджеров по выручке"
];

export function NaturalLanguageInput({ onSubmit, isLoading, suggestions = exampleQueries }: NaturalLanguageInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      await onSubmit(query);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSubmit(suggestion);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-900">AI-помощник</h3>
        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
          Beta
        </span>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Опишите, что хотите увидеть..."
            className="w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 animate-spin" />
          )}
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Отправить
        </button>
      </form>
      
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-2">Примеры запросов:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors"
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}