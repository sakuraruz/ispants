import { PivotResponse } from '../types';

export function exportToCSV(data: any[], columns: { id: string; name: string }[], filename: string = 'export.csv') {
  if (!data.length) {
    console.warn('Нет данных для экспорта');
    return;
  }
  
  // Заголовки
  const headers = columns.map(col => col.name).join(',');
  
  // Данные
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.id];
      
      // Экранирование значений с запятыми и кавычками
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value ?? '';
    }).join(',');
  });
  
  const csv = [headers, ...rows].join('\n');
  
  // Создание Blob и скачивание
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: any[], filename: string = 'export.json') {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(data: any[], columns: { id: string; name: string }[]) {
  if (!data.length) return;
  
  // Форматирование таблицы для буфера обмена
  const headers = columns.map(col => col.name).join('\t');
  const rows = data.map(row => {
    return columns.map(col => row[col.id] ?? '').join('\t');
  });
  
  const text = [headers, ...rows].join('\n');
  
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Ошибка копирования:', err);
    throw new Error('Не удалось скопировать данные');
  }
}