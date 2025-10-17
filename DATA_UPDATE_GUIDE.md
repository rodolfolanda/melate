# Automated Lottery Data Updates

This project includes an automated system to keep lottery CSV files up-to-date with the latest data from BCLC (British Columbia Lottery Corporation).

## 🎯 Overview

Instead of manually downloading CSV files from the official lottery websites, we've implemented an automated solution that:

1. ✅ Downloads official ZIP archives from PlayNow.com
2. ✅ Extracts the latest CSV data
3. ✅ Updates local files automatically
4. ✅ Can run on-demand or on a schedule
5. ✅ Creates pull requests with updates (via GitHub Actions)

## 📦 Data Sources

All data is downloaded from official BCLC/PlayNow archives:

| Lottery | Data Source URL |
|---------|----------------|
| **Lotto 6/49** | https://www.playnow.com/resources/documents/downloadable-numbers/649.zip |
| **Lotto Max** | https://www.playnow.com/resources/documents/downloadable-numbers/LOTTOMAX.zip |
| **BC/49** | Uses same data as 6/49 |

## 🚀 Usage

### Manual Update (On-Demand)

Run this command anytime you want to update the data:

```bash
npm run update:data
```

**Output:**
```
🎰 Lottery Data Updater
========================

Updating lottery data from BCLC (PlayNow.com)...

📥 Downloading Lotto 6/49...
✅ Downloaded Lotto 6/49
✅ Updated data/649.csv
   File size: 197.83 KB

📥 Downloading Lotto Max...
✅ Downloaded Lotto Max
✅ Updated data/LOTTOMAX.csv
   File size: 365.67 KB

📥 Downloading BC/49...
✅ Downloaded BC/49
✅ Updated data/BC49.csv
   File size: 197.83 KB

========================
📊 Update Summary:
   ✅ Successful: 3
   ❌ Failed: 0
========================

🎉 All lottery data updated successfully!
```

### Automated Updates (GitHub Actions)

The project includes a GitHub Actions workflow that:

- **Runs automatically**: Every Monday at 9 AM UTC (1 AM PST / 2 AM PDT)
- **Can be triggered manually**: From the GitHub Actions tab
- **Creates PRs automatically**: When new data is available
- **100% FREE**: Unlimited runs for public repositories

#### Workflow File
Location: `.github/workflows/update-data.yml`

#### Manual Trigger
1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select "Update Lottery Data" workflow
4. Click "Run workflow"

#### What It Does
1. Downloads latest data from BCLC
2. Checks if there are any changes
3. If changes exist, creates a Pull Request with:
   - Updated CSV files
   - Detailed description
   - `automated` and `data-update` labels
4. You review and merge the PR

## 📁 Files Created/Modified

### New Files
- `src/update-lottery-data.ts` - Update script
- `.github/workflows/update-data.yml` - Automated workflow
- `DATA_UPDATE_GUIDE.md` - This documentation

### Updated Files
- `package.json` - Added `update:data` script
- `data/649.csv` - Updated with latest Lotto 6/49 data
- `data/LOTTOMAX.csv` - Updated with latest Lotto Max data
- `data/BC49.csv` - Updated with latest BC/49 data

### Dependencies Added
- `adm-zip` - For handling ZIP file extraction
- `@types/adm-zip` - TypeScript types
- `tsx` - For running TypeScript files directly

## 🔧 How It Works

### Script Architecture

```typescript
1. Download ZIP file from PlayNow.com
   ↓
2. Extract CSV from ZIP archive
   ↓
3. Save to data/ directory
   ↓
4. Clean up temporary files
   ↓
5. Report success/failure
```

### Error Handling
- ✅ Handles HTTP redirects (301, 302)
- ✅ Validates HTTP status codes
- ✅ Cleans up temporary files on error
- ✅ Provides detailed error messages
- ✅ Continues processing other files if one fails

### Security Features
- ✅ Downloads from official BCLC sources only
- ✅ No third-party APIs or scrapers
- ✅ Validates file integrity
- ✅ Uses HTTPS for all downloads

## 🎛️ Configuration

### Modify Update Schedule

Edit `.github/workflows/update-data.yml`:

```yaml
schedule:
  - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

**Common schedules:**
```yaml
'0 9 * * 1'    # Every Monday at 9 AM
'0 9 * * *'    # Every day at 9 AM
'0 9 1 * *'    # First day of every month at 9 AM
'0 9 * * 0,3'  # Every Sunday and Wednesday at 9 AM
```

### Add More Data Sources

Edit `src/update-lottery-data.ts`:

```typescript
const DATA_SOURCES: LotteryDataSource[] = [
  // ... existing sources ...
  {
    name: 'New Lottery',
    url: 'https://example.com/data.zip',
    outputFile: 'data/new-lottery.csv',
    csvFileName: 'data.csv',
  },
];
```

## 🧪 Testing

### Test Locally
```bash
npm run update:data
```

### Test in GitHub Actions
1. Push changes to GitHub
2. Go to Actions tab
3. Manually trigger "Update Lottery Data" workflow
4. Watch the workflow run

## 📊 Benefits

### Before (Manual Process)
- ❌ Visit 3 different websites
- ❌ Download 3 ZIP files manually
- ❌ Extract CSVs one by one
- ❌ Replace files in project
- ❌ Easy to forget or procrastinate
- ❌ Time-consuming (5-10 minutes)

### After (Automated Process)
- ✅ Run one command: `npm run update:data`
- ✅ Or let GitHub Actions do it automatically
- ✅ Takes 5-10 seconds
- ✅ Never forget to update
- ✅ Always have latest data
- ✅ Pull requests for review

## 🆘 Troubleshooting

### "Failed to download: 403"
- The website is blocking the request
- Solution already implemented: Uses proper User-Agent header

### "CSV file not found in ZIP"
- The ZIP structure may have changed
- Check the ZIP contents manually
- Update `csvFileName` in the configuration

### GitHub Actions not creating PR
- Check if there are actual changes in the data
- Verify GitHub token permissions
- Check the Actions logs for errors

## 🎉 Success!

Your lottery data is now:
- ✅ Automatically updated
- ✅ Always current
- ✅ From official sources
- ✅ No manual work required

Just sit back and let automation do the work! 🚀

---

**Next Steps:**
1. Commit these changes
2. Push to GitHub
3. Watch the first automated update (next Monday)
4. Review and merge the auto-generated PR

**Manual update anytime:** `npm run update:data`
