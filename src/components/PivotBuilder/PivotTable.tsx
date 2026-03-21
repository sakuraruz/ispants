import React, { useMemo } from 'react';
import { PivotResponse } from '../../types';

interface PivotTableProps {
  data: PivotResponse;
  onCellClick?: (row: number, col: number) => void;
}

export function PivotTable({ data, onCellClick }: PivotTableProps) {
  const hasTotals = useMemo(() => {
    return data.totals && (data.totals.rowTotals?.length > 0 || data.totals.columnTotals?.length > 0);
  }, [data]);

  if (!data.columns?.length || !data.rows?.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-400">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100">
              {/* Пустая ячейка для угла */}
            </th>
            {data.columns.map((col, index) => (
              <th key={index} className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700 min-w-[120px]">
                {col}
              </th>
            ))}
            {hasTotals && (
              <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700 bg-gray-100">
                Итого
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
              <th className="border border-gray-200 px-4 py-2 text-left font-medium text-gray-700 sticky left-0 bg-white">
                {row.label}
              </th>
              {row.values.map((value, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-gray-200 px-4 py-2 text-right text-gray-900"
                  onClick={() => onCellClick?.(rowIndex, colIndex)}
                >
                  {typeof value === 'number' 
                    ? value.toLocaleString() 
                    : value || '-'}
                </td>
              ))}
              {hasTotals && data.totals?.rowTotals && (
                <td className="border border-gray-200 px-4 py-2 text-right font-medium text-gray-900 bg-gray-50">
                  {typeof data.totals.rowTotals[rowIndex] === 'number'
                    ? data.totals.rowTotals[rowIndex].toLocaleString()
                    : data.totals.rowTotals[rowIndex] || '-'}
                </td>
              )}
            </tr>
          ))}
          
          {/* Итоговая строка */}
          {hasTotals && data.totals?.columnTotals && (
            <tr className="bg-gray-100 font-medium">
              <th className="border border-gray-200 px-4 py-2 text-left text-gray-700 sticky left-0 bg-gray-100">
                Итого
              </th>
              {data.totals.columnTotals.map((total, index) => (
                <td key={index} className="border border-gray-200 px-4 py-2 text-right text-gray-900">
                  {typeof total === 'number' ? total.toLocaleString() : total || '-'}
                </td>
              ))}
              {data.totals.grandTotal !== undefined && (
                <td className="border border-gray-200 px-4 py-2 text-right text-gray-900 bg-gray-100">
                  {typeof data.totals.grandTotal === 'number'
                    ? data.totals.grandTotal.toLocaleString()
                    : data.totals.grandTotal || '-'}
                </td>
              )}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}