// Browser-compatible CSV processing for lottery data

async function fetchCsvFile(filePath: string): Promise<string> {
  const response = await fetch(`/${filePath}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${filePath}: ${response.statusText}`);
  }
  return response.text();
}

function parseCsvToJson(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    
    results.push(row);
  }

  return results;
}

function extractNumberDrawnValues(json: Record<string, string>[]): number[][] {
  return json.map(entry => {
    const values: number[] = [];
    for (const key in entry) {
      if (key.startsWith('NUMBER DRAWN')) {
        const num = Number(entry[key]);
        if (!isNaN(num) && num > 0) {
          values.push(num);
        }
      }
    }
    return values;
  });
}

export async function processCsvFileBrowser(filePath: string): Promise<number[][]> {
  try {
    const csvText = await fetchCsvFile(filePath);
    const json = parseCsvToJson(csvText);
    return extractNumberDrawnValues(json);
  } catch (error) {
    console.error(`Error processing CSV file ${filePath}:`, error);
    throw error;
  }
}
