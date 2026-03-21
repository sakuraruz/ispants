import React from 'react';
import { Attribute, AggregationType } from '../../types';
import { aggregationLabels } from '../../utils/aggregations';

interface AttributeSelectorProps {
  title: string;
  attributes: Attribute[];
  selected: string[];
  selectedAggregations?: Record<string, AggregationType>;
  onChange: (selected: string[]) => void;
  onAggregationChange?: (field: string, aggregation: AggregationType) => void;
  type: 'dimension' | 'measure';
  allowAggregation?: boolean;
}

export function AttributeSelector({
  title,
  attributes,
  selected,
  selectedAggregations = {},
  onChange,
  onAggregationChange,
  type,
  allowAggregation = false
}: AttributeSelectorProps) {
  const filteredAttributes = attributes.filter(attr => attr.type === type);

  const toggleAttribute = (attributeName: string) => {
    if (selected.includes(attributeName)) {
      onChange(selected.filter(s => s !== attributeName));
    } else {
      onChange([...selected, attributeName]);
    }
  };

  const aggregations: AggregationType[] = ['sum', 'avg', 'count', 'min', 'max', 'countUnique'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {type === 'dimension' ? 'Группировка данных' : 'Числовые показатели'}
        </p>
      </div>
      
      <div className="p-3 max-h-64 overflow-y-auto">
        {filteredAttributes.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Нет доступных атрибутов
          </p>
        ) : (
          <div className="space-y-1">
            {filteredAttributes.map(attr => {
              const isSelected = selected.includes(attr.name);
              const currentAgg = selectedAggregations[attr.name];
              
              return (
                <div key={attr.name} className="group">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleAttribute(attr.name)}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{attr.name}</span>
                      {attr.dataType && (
                        <span className="text-xs text-gray-400">
                          ({attr.dataType === 'number' ? 'число' : 'текст'})
                        </span>
                      )}
                    </div>
                    
                    {allowAggregation && isSelected && onAggregationChange && (
                      <select
                        value={currentAgg || 'sum'}
                        onChange={(e) => onAggregationChange(attr.name, e.target.value as AggregationType)}
                        className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {aggregations.map(agg => (
                          <option key={agg} value={agg}>
                            {aggregationLabels[agg]}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selected.length > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          Выбрано: {selected.length}
        </div>
      )}
    </div>
  );
}