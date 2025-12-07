import Papa from 'papaparse';

export const parseCSV = async (filePath) => {
  try {
    const response = await fetch(filePath);
    const text = await response.text();
    
    console.log(`Loading ${filePath}...`);
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        dynamicTyping: true, // Automatically convert numbers
        skipEmptyLines: true,
        complete: (results) => {
          console.log(`✅ Parsed ${results.data.length} rows from ${filePath}`);
          if (results.data.length > 0) {
            console.log('Headers:', Object.keys(results.data[0]));
            console.log('Sample row:', results.data[0]);
          }
          if (results.errors.length > 0) {
            console.warn('Parsing errors:', results.errors);
          }
          resolve(results.data);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
};