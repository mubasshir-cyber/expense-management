'use client';

import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { testAppsScriptConnection } from '../services/api';
import {
  X,
  Sheet,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileCode2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const APPS_SCRIPT_CODE_SNIPPET = `/**
 * SBI Expense Manager - Google Apps Script Backend
 * Paste this in: Google Sheets -> Extensions -> Apps Script
 * Deploy as: Web app (Execute as: Me, Who has access: Anyone)
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
      return responseJSON({
        status: "success",
        data: { transactions: fetchTransactions(), accounts: fetchAccounts() }
      });
    }
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
      try { data = JSON.parse(e.postData.contents); } catch (err) { data = e.parameter; }
    } else {
      data = e.parameter;
    }
    const action = data.action || "addTransaction";
    if (action === "addTransaction") {
      const newTx = addTransactionRecord(data);
      return responseJSON({ status: "success", data: newTx, message: "Added successfully" });
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
    return responseJSON({ status: "error", message: "Invalid action" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function saveAccountsList(accountsList, oldName, newName) {
  const sheet = getOrCreateSheet(SHEET_ACCOUNTS);
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
  if (oldName && newName && oldName !== newName) {
    const txSheet = getOrCreateSheet(SHEET_TRANSACTIONS);
    const rows = txSheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][4]) === String(oldName)) {
        txSheet.getRange(i + 1, 5).setValue(newName);
      }
    }
  }
  return fetchAccounts();
}

function fetchTransactions() {
  const sheet = getOrCreateSheet(SHEET_TRANSACTIONS);
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    let dateStr = row[1] instanceof Date ? Utilities.formatDate(row[1], Session.getScriptTimeZone(), "yyyy-MM-dd") : String(row[1] || "");
    list.push({
      id: String(row[0]), date: dateStr, type: String(row[2] || "Expense"),
      category: String(row[3] || "Other"), account: String(row[4] || "SBI Savings Account"),
      amount: parseFloat(row[5]) || 0, note: String(row[6] || ""),
      createdAt: row[7] ? String(row[7]) : new Date().toISOString()
    });
  }
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
      name: String(row[0]), initialBalance: parseFloat(row[1]) || 0,
      type: String(row[2] || "Bank"), accountNumber: String(row[3] || ""), color: String(row[4] || "#183e8b")
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

function processTransfer(data) {
  const debitTx = addTransactionRecord({
    date: data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    type: "Expense",
    category: "Transfer",
    account: data.fromAccount,
    amount: data.amount,
    note: data.note || ("Transfer to " + data.toAccount)
  });
  const creditTx = addTransactionRecord({
    date: data.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd"),
    type: "Credit",
    category: "Transfer",
    account: data.toAccount,
    amount: data.amount,
    note: data.note || ("Transfer from " + data.fromAccount)
  });
  return { debitTx, creditTx };
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}`;

export const SettingsModal = () => {
  const {
    isSettingsModalOpen,
    closeSettingsModal,
    scriptUrl,
    updateScriptUrl,
    isConnected,
    clearAllData,
  } = useExpense();

  const [inputUrl, setInputUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (isSettingsModalOpen) {
      setInputUrl(scriptUrl || '');
      setTestResult(null);
    }
  }, [isSettingsModalOpen, scriptUrl]);

  if (!isSettingsModalOpen) return null;

  const handleTestAndSave = async () => {
    if (!inputUrl.trim()) {
      await updateScriptUrl('');
      setTestResult({ success: true, message: 'Cleared URL. Running in Local Storage Mode.' });
      return;
    }

    setTesting(true);
    setTestResult(null);
    const result = await testAppsScriptConnection(inputUrl.trim());
    setTesting(false);
    setTestResult(result);

    if (result.success) {
      await updateScriptUrl(inputUrl.trim());
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-0 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 typo-label">Google Sheet DB Setup</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Link Google Apps Script Endpoint</p>
            </div>
          </div>
          <button
            onClick={closeSettingsModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Indicator */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {isConnected ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                {isConnected ? 'Google Sheet Live Sync Active' : 'Offline / Local Storage Mode Active'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {isConnected
                  ? 'All additions, updates, and balance changes are stored directly in your Google Sheet.'
                  : 'You can test all features right now with local storage. Follow the 3-step setup below to store data in your personal Google Sheet.'}
              </p>
            </div>
          </div>

          {/* Web App URL Input */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider typo-label">
              Google Apps Script Web App URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleTestAndSave}
                disabled={testing}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-blue-600/20 typo-label"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{testing ? 'Testing...' : 'Test & Save'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`text-xs p-3 rounded-xl border font-bold font-mono ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* 3 Step Quick Setup Guide */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 typo-label">
              <span>Quick 3-Step Setup Guide</span>
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 font-mono font-bold ml-auto"
              >
                <span>OPEN SHEETS</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </h4>

            <ol className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>
                  Create a new Sheet at{' '}
                  <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">
                    sheets.new
                  </a>
                  , then click <strong>Extensions &gt; Apps Script</strong>.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>
                  Copy the code below and paste it into the Apps Script editor replacing any existing code.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>
                  Click <strong>Deploy &gt; New deployment</strong>, select type <strong>Web app</strong>, set <em>Who has access</em> to <strong>Anyone</strong>, click Deploy, and paste the URL above.
                </span>
              </li>
            </ol>
          </div>

          {/* Collapsible Apps Script Code Viewer */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-slate-100">
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-blue-400" />
                <span>Google Apps Script Code (`Code.gs`)</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">{showCode ? 'Hide' : 'View'}</span>
                {showCode ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {showCode && (
              <div className="relative">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors shadow-lg z-10"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'COPIED!' : 'COPY CODE'}</span>
                </button>
                <pre className="p-4 bg-slate-950 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-60 leading-relaxed border-t border-slate-800">
                  {APPS_SCRIPT_CODE_SNIPPET}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied to clipboard' : 'Copy Code.gs Snippet'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all local data and transactions to zero?')) {
                  clearAllData();
                }
              }}
              className="text-xs font-mono font-bold text-rose-600 hover:text-rose-700 transition-colors ml-2"
            >
              Clear Local Data
            </button>
          </div>
          <button
            type="button"
            onClick={closeSettingsModal}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition-colors uppercase font-mono"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
