# 📊 Google Apps Script Setup Guide

Follow these simple steps to link your Google Sheet with the SBI Expense Management System:

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name your spreadsheet **"SBI Expense Tracker"**.

### Step 2: Open Apps Script
1. In Google Sheets, click on the top menu: **Extensions** > **Apps Script**.
2. Clear any default code in the editor.
3. Open `apps-script/Code.gs` from this project, copy all the code, and paste it into the Apps Script editor.
4. Click the **Save** (💾) icon or press `Ctrl + S`.

### Step 3: Deploy as Web App
1. In the top right corner of Apps Script, click **Deploy** > **New deployment**.
2. Click the gear icon (⚙️) next to "Select type" and choose **Web app**.
3. Fill in the deployment details:
   - **Description**: `SBI Expense API`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Crucial: This enables your Next.js app to send and receive records!)*
4. Click **Deploy**.
5. Google may ask to authorize access. Click **Authorize access**, select your account, click **Advanced**, and then click **Go to Untitled project (unsafe)** -> **Allow**.
6. Copy the generated **Web App URL** (looks like `https://script.google.com/macros/s/.../exec`).

### Step 4: Connect to Next.js App
1. Open the SBI Expense Web App on your browser (`http://localhost:3000`).
2. Click on the **⚙️ Sheet Connection** or **Sync Status** button in the top navigation.
3. Paste your **Web App URL** and click **Test & Save Connection**.
4. That's it! All transactions will now sync directly to your Google Sheet in real-time.
