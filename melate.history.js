"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCsvFile = processCsvFile;
const csv = __importStar(require("csv-parser"));
const fs = __importStar(require("fs"));
function csvToJson(filePath, options = {}) {
    const delimiter = options.delimiter || ',';
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv.default({ separator: delimiter }))
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}
function extractNumberDrawnValues(json) {
    return json.map(entry => {
        const values = [];
        for (const key in entry) {
            if (key.startsWith('NUMBER DRAWN')) {
                values.push(Number(entry[key]));
            }
        }
        return values;
    });
}
async function processCsvFile(filePath) {
    try {
        const json = await csvToJson(filePath);
        return extractNumberDrawnValues(json);
    }
    catch (error) {
        console.error('Error converting CSV to JSON:', error);
        throw error;
    }
}
