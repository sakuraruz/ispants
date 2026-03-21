import React from 'react';
import { Brain, ThumbsUp, ThumbsDown } from 'lucide-react';
import { RecommendedPivot } from '../../types';

interface AIPanelProps {
  recommendations: RecommendedPivot | null;
  onApplyRecommendation: (recommendation: RecommendedPivot) => void;
  onFeedback?: (isPositive: boolean) => void;
  isLoading?: boolean;
}

export function AIPanel({ recommendations, onApplyRecommendation, onFeedback, isLoading }: AIPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center animate-pulse">
            <Brain className="w-4 h-4 text-green-600" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">AI-рекомендации</h3>
        </div>
        <p className="text-sm text-gray-500">
          Начните строить таблицу, чтобы получить рекомендации от ИИ
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Рекомендация</h3>
            <p className="text-xs text-gray-500">
              Уверенность: {Math.round(recommendations.confidence * 100)}%
            </p>
          </div>
        </div>
        {onFeedback && (
          <div className="flex gap-1">
            <button
              onClick={() => onFeedback(true)}
              className="p-1 hover:bg-green-50 rounded transition-colors"
              title="Полезно"
            >
              <ThumbsUp className="w-4 h-4 text-gray-400 hover:text-green-600" />
            </button>
            <button
              onClick={() => onFeedback(false)}
              className="p-1 hover:bg-red-50 rounded transition-colors"
              title="Не полезно"
            >
              <ThumbsDown className="w-4 h-4 text-gray-400 hover:text-red-600" />
            </button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-700 mb-3">{recommendations.explanation}</p>
      
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="text-xs text-gray-500 mb-2">Предлагаемая структура:</div>
        <div className="space-y-1 text-sm">
          {recommendations.rows.length > 0 && (
            <div><span className="font-medium text-gray-700">Строки:</span> {recommendations.rows.join(', ')}</div>
          )}
          {recommendations.columns.length > 0 && (
            <div><span className="font-medium text-gray-700">Колонки:</span> {recommendations.columns.join(', ')}</div>
          )}
          {recommendations.values.length > 0 && (
            <div><span className="font-medium text-gray-700">Значения:</span> {recommendations.values.map(v => `${v.field} (${v.aggregation})`).join(', ')}</div>
          )}
        </div>
      </div>
      
      <button
        onClick={() => onApplyRecommendation(recommendations)}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
      >
        Применить рекомендацию
      </button>
    </div>
  );
}