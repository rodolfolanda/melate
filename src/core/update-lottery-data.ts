#!/usr/bin/env node

/**
 * Lottery Data Updater
 * 
 * This script automatically downloads the latest lottery data from BCLC (PlayNow)
 * and updates the local CSV files.
 * 
 * Data sources:
 * - Lotto 6/49: https://www.playnow.com/resources/documents/downloadable-numbers/649.zip
 * - Lotto Max: https://www.playnow.com/resources/documents/downloadable-numbers/LOTTOMAX.zip
 * - BC/49: Uses the same Extra file as 6/49
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import AdmZip from 'adm-zip';

interface LotteryDataSource {
  name: string;
  url: string;
  outputFile: string;
  csvFileName?: string; // Name of CSV file inside the ZIP
}

const DATA_SOURCES: LotteryDataSource[] = [
  {
    name: 'Lotto 6/49',
    url: 'https://www.playnow.com/resources/documents/downloadable-numbers/649.zip',
    outputFile: 'data/649.csv',
    csvFileName: '649.csv',
  },
  {
    name: 'Lotto Max',
    url: 'https://www.playnow.com/resources/documents/downloadable-numbers/LOTTOMAX.zip',
    outputFile: 'data/LOTTOMAX.csv',
    csvFileName: 'LOTTOMAX.csv',
  },
  {
    name: 'BC/49',
    url: 'https://www.playnow.com/resources/documents/downloadable-numbers/649.zip',
    outputFile: 'data/BC49.csv',
    csvFileName: '649.csv', // BC49 uses same data as 649
  },
];

const TEMP_DIR = path.join(process.cwd(), '.temp-lottery-data');

// HTTP status codes
const HTTP_OK = 200;
const HTTP_MOVED_PERMANENTLY = 301;
const HTTP_FOUND = 302;
const BYTES_PER_KB = 1024;

/**
 * Downloads a file from a URL
 */
function downloadFile(url: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    };
    
    https.get(url, options, (response) => {
      if (response.statusCode === HTTP_FOUND || response.statusCode === HTTP_MOVED_PERMANENTLY) {
        // Handle redirects
        if (response.headers.location) {
          downloadFile(response.headers.location, destination)
            .then(resolve)
            .catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== HTTP_OK) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(destination, () => reject(err));
      });
    }).on('error', (err) => {
      fs.unlink(destination, () => reject(err));
    });
  });
}

/**
 * Extracts a specific CSV file from a ZIP archive
 */
function extractCsvFromZip(zipPath: string, csvFileName: string, outputPath: string): void {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();
  
  // Find the CSV file in the ZIP
  const csvEntry = zipEntries.find(entry => 
    entry.entryName.toLowerCase().includes(csvFileName.toLowerCase()) ||
    entry.entryName.toLowerCase().endsWith('.csv'),
  );
  
  if (!csvEntry) {
    throw new Error(`CSV file not found in ZIP: ${csvFileName}`);
  }
  
  // Extract and save the CSV
  const csvContent = zip.readAsText(csvEntry);
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
}

/**
 * Updates a single lottery data source
 */
async function updateDataSource(source: LotteryDataSource): Promise<void> {
  console.log(`\n📥 Downloading ${source.name}...`);
  
  const sanitizedName = source.name.replace(/[^a-zA-Z0-9]/g, '_');
  const zipPath = path.join(TEMP_DIR, `${sanitizedName}.zip`);
  
  try {
    // Download the ZIP file
    await downloadFile(source.url, zipPath);
    console.log(`✅ Downloaded ${source.name}`);
    
    // Extract the CSV
    extractCsvFromZip(zipPath, source.csvFileName ?? `${source.name}.csv`, source.outputFile);
    console.log(`✅ Updated ${source.outputFile}`);
    
    // Show file size
    const stats = fs.statSync(source.outputFile);
    const sizeInKB = (stats.size / BYTES_PER_KB).toFixed(2);
    console.log(`   File size: ${sizeInKB} KB`);
    
  } catch (error) {
    console.error(`❌ Failed to update ${source.name}:`, error);
    throw error;
  } finally {
    // Clean up ZIP file
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('🎰 Lottery Data Updater');
  console.log('========================\n');
  console.log('Updating lottery data from BCLC (PlayNow.com)...\n');
  
  // Create temp directory
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
  
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  let successCount = 0;
  let failureCount = 0;
  
  // Update each data source
  for (const source of DATA_SOURCES) {
    try {
      await updateDataSource(source);
      successCount++;
    } catch {
      failureCount++;
      console.error(`Failed to update ${source.name}`);
    }
  }
  
  // Clean up temp directory
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  
  // Summary
  console.log('\n========================');
  console.log('📊 Update Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failureCount}`);
  console.log('========================\n');
  
  if (failureCount > 0) {
    console.log('⚠️  Some updates failed. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('🎉 All lottery data updated successfully!');
    console.log('   Your CSV files are now up to date.\n');
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
