import * as csv from 'csv-parser';
import * as fs from 'fs';

interface CsvToJsonOptions {
    delimiter?: string;
}

function csvToJson(filePath: string, options: CsvToJsonOptions = {}): Promise<any[]> {
    const delimiter = options.delimiter || ',';
    const results: any[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv.default({ separator: delimiter }))
            .on('data', (data: any) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error: any) => reject(error));
    });
}

function extractNumberDrawnValues(json: any[]): number[][] {
    return json.map(entry => {
        const values: number[] = [];
        for (const key in entry) {
            if (key.startsWith('NUMBER DRAWN')) {
                values.push(Number(entry[key]));
            }
        }
        return values;
    });
}

async function processCsvFile(filePath: string): Promise<number[][]> {
    try {
        const json = await csvToJson(filePath);
        return extractNumberDrawnValues(json);
    } catch (error) {
        console.error('Error converting CSV to JSON:', error);
        throw error;
    }
}

export { processCsvFile};

