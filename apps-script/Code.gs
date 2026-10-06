/**
 * ===================================================================
 * SBI Expense Manager - Google Apps Script Backend
 * ===================================================================
 * 
 * Instructions:
 * 1. Open your Google Sheet (create a new one: https://sheets.new)
 * 2. Go to Extensions -> Apps Script
 * 3. Delete any default code and paste this entire file
 * 4. Click Deploy -> New deployment
 * 5. Select type: "Web app"
 * 6. Set Description: "SBI Expense API"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone" (Crucial for frontend connection)
 * 9. Click "Deploy" and copy the Web App URL!
 * 10. Paste the Web App URL into your Next.js app settings.
 * ===================================================================
 */

const SHEET_TRANSACTIONS = "Transactions";
const SHEET_ACCOUNTS = "Accounts";

function getOrCreateSheet(sheetName, defaultHeaders) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (defaultHeaders && defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
      sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold").setBackground("#183e8b").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function initSheets() {
  const txHeaders = ["ID", "Date", "Type", "Category", "Account", "Amount", "Note", "CreatedAt"];
  const accHeaders = ["AccountName", "InitialBalance", "Type", "AccountNumber", "Color"];
  
  getOrCreateSheet(SHEET_TRANSACTIONS, txHeaders);
  const accSheet = getOrCreateSheet(SHEET_ACCOUNTS, accHeaders);
  
  // Seed default accounts if empty
  if (accSheet.getLastRow() <= 1) {
    accSheet.appendRow(["SBI Savings Account", 0, "Bank", "XX3821", "#183e8b"]);
    accSheet.appendRow(["SBI Credit Card", 0, "Credit Card", "XX9012", "#e11d48"]);
    accSheet.appendRow(["UPI / Wallet", 0, "Wallet", "UPI", "#059669"]);
    accSheet.appendRow(["Cash", 0, "Cash", "CASH", "#d97706"]);
  }
}

function doGet(e) {
  try {
    initSheets();
    const action = (e && e.parameter && e.parameter.action) || "getTransactions";
    
    if (action === "ping" || action === "test") {
      return responseJSON({ status: "success", message: "SBI Expense API is connected and active!" });
    }
    
    if (action === "getTransactions") {
      const transactions = fetchTransactions();
      const accounts = fetchAccounts();
      return responseJSON({
        status: "success",
        data: {
          transactions: transactions,
          accounts: accounts
        }
      });
    }

    if (action === "getAccounts") {
      const accounts = fetchAccounts();
      return responseJSON({ status: "success", data: accounts });
    }

    // Support deletion or addition via GET if POST faces CORS issues
    if (action === "deleteTransaction" && e.parameter.id) {
      const deleted = deleteTransactionById(e.parameter.id);
      return responseJSON({ status: deleted ? "success" : "error", message: deleted ? "Deleted" : "Not found" });
    }

    return responseJSON({ status: "error", message: "Unknown action" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  try {
    initSheets();
    let data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    const action = data.action || "addTransaction";

    if (action === "addTransaction") {
      const newTx = addTransactionRecord(data);
      return responseJSON({ status: "success", data: newTx, message: "Transaction added successfully" });
    }

    if (action === "updateTransaction") {
      const updated = updateTransactionRecord(data);
      return responseJSON({ status: updated ? "success" : "error", message: updated ? "Updated successfully" : "Transaction not found" });
    }

    if (action === "deleteTransaction") {
      const deleted = deleteTransactionById(data.id);
      return responseJSON({ status: deleted ? "success" : "error", message: deleted ? "Deleted successfully" : "Transaction not found" });
    }

    if (action === "transfer") {
      const res = processTransfer(data);
      return responseJSON({ status: "success", message: "Transfer completed successfully", data: res });
    }

    if (action === "saveAccounts") {
      const saved = saveAccountsList(data.accounts, data.oldName, data.newName);
      return responseJSON({ status: "success", message: "Accounts saved successfully", data: saved });
    }

    if (action === "addAccount") {
      const newAcc = addAccountRecord(data);
      return responseJSON({ status: "success", message: "Account added", data: newAcc });
    }

    if (action === "deleteAccount") {
      const deleted = deleteAccountByName(data.name);
      return responseJSON({ status: deleted ? "success" : "error", message: deleted ? "Account deleted" : "Account not found" });
    }

    return responseJSON({ status: "error", message: "Invalid action" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function saveAccountsList(accountsList, oldName, newName) {
  const sheet = getOrCreateSheet(SHEET_ACCOUNTS);
  // Clear all data and formatting on Accounts sheet
  sheet.clear();
  
  const accHeaders = ["AccountName", "InitialBalance", "Type", "AccountNumber", "Color"];
  sheet.appendRow(accHeaders);
  sheet.getRange(1, 1, 1, accHeaders.length).setFontWeight("bold").setBackground("#183e8b").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  
  if (Array.isArray(accountsList) && accountsList.length > 0) {
    accountsList.forEach(function(acc) {
      sheet.appendRow([
        String(acc.name || "").trim(),
        parseFloat(acc.initialBalance) || 0,
        String(acc.type || "Bank"),
        String(acc.accountNumber || ""),
        String(acc.color || "#183e8b")
      ]);
    });
  }
  
  // If an account was renamed, also update historical transactions referencing oldName
  if (oldName && newName && oldName !== newName) {
    renameAccountInTransactions(oldName, newName);
  }
  
  return fetchAccounts();
}

function renameAccountInTransactions(oldName, newName) {
  const sheet = getOrCreateSheet(SHEET_TRANSACTIONS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][4]) === String(oldName)) {
      sheet.getRange(i + 1, 5).setValue(newName);
    }
  }
}

function addAccountRecord(acc) {
  const sheet = getOrCreateSheet(SHEET_ACCOUNTS);
  sheet.appendRow([
    String(acc.name || "New Account").trim(),
    parseFloat(acc.initialBalance) || 0,
    String(acc.type || "Bank"),
    String(acc.accountNumber || ""),
    String(acc.color || "#183e8b")
  ]);
  return acc;
}

function deleteAccountByName(name) {
  const sheet = getOrCreateSheet(SHEET_ACCOUNTS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === String(name).toLowerCase()) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function fetchTransactions() {
  const sheet = getOrCreateSheet(SHEET_TRANSACTIONS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const list = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue; // Skip blank ID
    
    // Parse date safely
    let dateStr = "";
    if (row[1] instanceof Date) {
      dateStr = Utilities.formatDate(row[1], Session.getScriptTimeZone(), "yyyy-MM-dd");
    } else {
      dateStr = String(row[1] || "");
    }

    list.push({
      id: String(row[0]),
      date: dateStr,
      type: String(row[2] || "Expense"),
      category: String(row[3] || "Other"),
      account: String(row[4] || "SBI Savings Account"),
      amount: parseFloat(row[5]) || 0,
      note: String(row[6] || ""),
      createdAt: row[7] ? String(row[7]) : new Date().toISOString()
    });
  }

  // Return newest first
  return list.reverse();
}

function fetchAccounts() {
  const sheet = getOrCreateSheet(SHEET_ACCOUNTS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    list.push({
      name: String(row[0]),
      initialBalance: parseFloat(row[1]) || 0,
      type: String(row[2] || "Bank"),
      accountNumber: String(row[3] || ""),
      color: String(row[4] || "#183e8b")
    });
  }
  return list;
}

function addTransactionRecord(data) {
  const sheet = getOrCreateSheet(SHEET_TRANSACTIONS);
  const id = data.id || "tx_" + new Date().getTime() + "_" + Math.floor(Math.random() * 1000);
  const date = data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  const type = data.type === "Credit" ? "Credit" : "Expense";
  const category = data.category || "General";
  const account = data.account || "SBI Savings Account";
  const amount = Math.abs(parseFloat(data.amount) || 0);
  const note = data.note || "";
  const createdAt = new Date().toISOString();

  sheet.appendRow([id, date, type, category, account, amount, note, createdAt]);

  return { id, date, type, category, account, amount, note, createdAt };
}

function deleteTransactionById(id) {
  const sheet = getOrCreateSheet(SHEET_TRANSACTIONS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function updateTransactionRecord(data) {
  const sheet = getOrCreateSheet(SHEET_TRANSACTIONS);
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.id)) {
      const rowIndex = i + 1;
      if (data.date) sheet.getRange(rowIndex, 2).setValue(data.date);
      if (data.type) sheet.getRange(rowIndex, 3).setValue(data.type);
      if (data.category) sheet.getRange(rowIndex, 4).setValue(data.category);
      if (data.account) sheet.getRange(rowIndex, 5).setValue(data.account);
      if (data.amount !== undefined) sheet.getRange(rowIndex, 6).setValue(parseFloat(data.amount));
      if (data.note !== undefined) sheet.getRange(rowIndex, 7).setValue(data.note);
      return true;
    }
  }
  return false;
}

function processTransfer(data) {
  const fromAccount = data.fromAccount;
  const toAccount = data.toAccount;
  const amount = Math.abs(parseFloat(data.amount) || 0);
  const date = data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  const note = data.note || `Transfer from ${fromAccount} to ${toAccount}`;

  // 1. Debit from source
  const debitTx = addTransactionRecord({
    date: date,
    type: "Expense",
    category: "Transfer",
    account: fromAccount,
    amount: amount,
    note: note
  });

  // 2. Credit to destination
  const creditTx = addTransactionRecord({
    date: date,
    type: "Credit",
    category: "Transfer",
    account: toAccount,
    amount: amount,
    note: note
  });

  return { debitTx, creditTx };
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
