// Генерация случайных данных для городов

// Словари для генерации данных
const CITY_NAMES = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
    'Нижний Новгород', 'Челябинск', 'Омск', 'Самара', 'Ростов-на-Дону',
    'Уфа', 'Красноярск', 'Пермь', 'Воронеж', 'Волгоград',
    'Краснодар', 'Саратов', 'Тюмень', 'Тольятти', 'Ижевск',
    'Барнаул', 'Ульяновск', 'Иркутск', 'Хабаровск', 'Ярославль',
    'Махачкала', 'Оренбург', 'Томск', 'Кемерово', 'Новокузнецк'
  ];
  
  const REGIONS = [
    'Центральный', 'Северо-Западный', 'Сибирский', 'Уральский', 'Приволжский',
    'Южный', 'Дальневосточный', 'Северо-Кавказский'
  ];
  
  const STREET_NAMES = [
    'Ленина', 'Советская', 'Мира', 'Центральная', 'Победы',
    'Гагарина', 'Кирова', 'Пушкина', 'Октябрьская', 'Лесная',
    'Заречная', 'Комсомольская', 'Садовая', 'Молодежная', 'Новая'
  ];
  
  const AREA_SUFFIXES = ['район', 'округ', 'территория'];
  
  // Генерация случайного числа в диапазоне
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Генерация случайного года
  const randomYear = () => randomInt(1000, 2024);
  
  // Генерация случайного населения
  const randomPopulation = () => randomInt(1000, 15000000);
  
  // Генерация случайной площади
  const randomArea = () => (randomInt(10, 5000) * 10).toLocaleString();
  
  // Генерация случайного города
  const randomCityName = () => CITY_NAMES[randomInt(0, CITY_NAMES.length - 1)];
  
  // Генерация случайного региона
  const randomRegion = () => REGIONS[randomInt(0, REGIONS.length - 1)];
  
  // Генерация случайной улицы
  const randomStreet = () => STREET_NAMES[randomInt(0, STREET_NAMES.length - 1)];
  
  // Генерация случайной области
  const randomOblast = () => `${randomCityName()}ская ${AREA_SUFFIXES[randomInt(0, AREA_SUFFIXES.length - 1)]}`;
  
  // Список возможных атрибутов (повторяются для достижения нужного количества)
  const ATTRIBUTE_TEMPLATES = [
    { name: 'Город', type: 'dimension', dataType: 'string', generator: randomCityName },
    { name: 'Население', type: 'measure', dataType: 'number', generator: randomPopulation },
    { name: 'Год основания', type: 'dimension', dataType: 'number', generator: randomYear },
    { name: 'Регион', type: 'dimension', dataType: 'string', generator: randomRegion },
    { name: 'Область', type: 'dimension', dataType: 'string', generator: randomOblast },
    { name: 'Столица области', type: 'dimension', dataType: 'string', generator: () => randomInt(0, 1) === 1 ? 'Да' : 'Нет' },
    { name: 'Площадь (км²)', type: 'measure', dataType: 'number', generator: randomArea },
    { name: 'Главная улица', type: 'dimension', dataType: 'string', generator: randomStreet },
    { name: 'Количество районов', type: 'measure', dataType: 'number', generator: () => randomInt(1, 50) },
    { name: 'Метро', type: 'dimension', dataType: 'string', generator: () => randomInt(0, 1) === 1 ? 'Есть' : 'Нет' },
    { name: 'Средняя зарплата', type: 'measure', dataType: 'number', generator: () => randomInt(30000, 150000) },
    { name: 'Количество школ', type: 'measure', dataType: 'number', generator: () => randomInt(10, 500) },
    { name: 'Количество больниц', type: 'measure', dataType: 'number', generator: () => randomInt(1, 100) },
    { name: 'Климат', type: 'dimension', dataType: 'string', generator: () => {
      const climates = ['Умеренный', 'Континентальный', 'Субтропический', 'Арктический'];
      return climates[randomInt(0, climates.length - 1)];
    }},
    { name: 'Высота над уровнем моря (м)', type: 'measure', dataType: 'number', generator: () => randomInt(0, 2000) },
    { name: 'Код города', type: 'dimension', dataType: 'number', generator: () => randomInt(100, 999) },
    { name: 'Часовой пояс', type: 'dimension', dataType: 'string', generator: () => `UTC+${randomInt(2, 12)}` },
    { name: 'Расстояние до Москвы (км)', type: 'measure', dataType: 'number', generator: () => randomInt(0, 15000) },
    { name: 'Туристический рейтинг', type: 'measure', dataType: 'number', generator: () => (randomInt(1, 5)).toString() },
    { name: 'Количество музеев', type: 'measure', dataType: 'number', generator: () => randomInt(1, 100) }
  ];
  
  // Функция для генерации атрибутов
  export const generateAttributes = (columnsCount: number) => {
    const attributes = [];
    for (let i = 0; i < columnsCount; i++) {
      const template = ATTRIBUTE_TEMPLATES[i % ATTRIBUTE_TEMPLATES.length];
      attributes.push({
        id: `attr_${i}`,
        name: i < ATTRIBUTE_TEMPLATES.length ? template.name : `${template.name}_${Math.floor(i / ATTRIBUTE_TEMPLATES.length) + 1}`,
        type: template.type,
        dataType: template.dataType,
        generator: template.generator
      });
    }
    return attributes;
  };
  
  // Функция для генерации данных таблицы
  export const generateTableData = (rowsCount: number, attributes: any[]) => {
    const data = [];
    
    for (let i = 0; i < rowsCount; i++) {
      const row: any = {
        id: i + 1,
        '№': i + 1
      };
      
      attributes.forEach((attr, colIndex) => {
        let value = attr.generator();
        
        // Форматирование чисел
        if (attr.dataType === 'number' && typeof value === 'number') {
          if (attr.name.includes('Население') || attr.name.includes('зарплата')) {
            value = value.toLocaleString();
          }
        }
        
        row[attr.name] = value;
      });
      
      data.push(row);
    }
    
    return data;
  };
  
  // API эмуляция
  export const mockApi = {
    // Получение атрибутов
    getAttributes: async (columnsCount: number = 20) => {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const attributes = generateAttributes(columnsCount);
      return attributes.map(attr => ({
        name: attr.name,
        type: attr.type,
        dataType: attr.dataType
      }));
    },
    
    // Получение данных
    getTableData: async (rowsCount: number, columnsCount: number) => {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const attributes = generateAttributes(columnsCount);
      const data = generateTableData(rowsCount, attributes);
      
      return {
        data,
        attributes: attributes.map(attr => ({
          name: attr.name,
          type: attr.type,
          dataType: attr.dataType
        })),
        totalRows: rowsCount,
        totalColumns: columnsCount
      };
    },
    
    // Построение сводной таблицы
    buildPivot: async (rows: string[], columns: string[], values: any[], data: any[]) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Группировка данных для сводной таблицы
      const pivotData: any = {};
      
      data.forEach(row => {
        const rowKey = rows.map(r => row[r]).join('|');
        const colKey = columns.map(c => row[c]).join('|');
        
        if (!pivotData[rowKey]) {
          pivotData[rowKey] = {};
        }
        
        if (!pivotData[rowKey][colKey]) {
          pivotData[rowKey][colKey] = {};
          values.forEach(v => {
            pivotData[rowKey][colKey][v.field] = [];
          });
        }
        
        values.forEach(v => {
          let val = row[v.field];
          if (typeof val === 'string') {
            val = parseFloat(val.replace(/\s/g, '')) || 0;
          }
          pivotData[rowKey][colKey][v.field].push(Number(val) || 0);
        });
      });
      
      // Агрегация данных
      const uniqueRows = [...new Set(data.map(row => rows.map(r => row[r]).join('|')))];
      const uniqueCols = [...new Set(data.map(row => columns.map(c => row[c]).join('|')))];
      
      const result = {
        columns: uniqueCols,
        rows: uniqueRows.map(rowKey => {
          const rowParts = rowKey.split('|');
          return {
            label: rowParts.join(' / '),
            values: uniqueCols.map(colKey => {
              const cell = pivotData[rowKey]?.[colKey];
              if (!cell) return 0;
              
              return values.map(v => {
                const numbers = cell[v.field];
                if (!numbers || numbers.length === 0) return 0;
                
                switch (v.aggregation) {
                  case 'sum':
                    return numbers.reduce((a, b) => a + b, 0);
                  case 'avg':
                    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
                  case 'count':
                    return numbers.length;
                  case 'min':
                    return Math.min(...numbers);
                  case 'max':
                    return Math.max(...numbers);
                  default:
                    return numbers[0];
                }
              }).join(' / ');
            })
          };
        })
      };
      
      return result;
    }
  };