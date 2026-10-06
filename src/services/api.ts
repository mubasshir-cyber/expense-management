import { Transaction, Account } from '../types';

export const SCRIPT_URL_STORAGE_KEY = 'sbi_expense_script_url';
export const LOCAL_TX_KEY = 'sbi_expense_local_tx';
export const LOCAL_ACCOUNTS_KEY = 'sbi_expense_local_accounts';

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface SheetDataResponse {
  transactions: Transaction[];
  accounts: Account[];
}

export const getStoredScriptUrl = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(SCRIPT_URL_STORAGE_KEY) || process.env.NEXT_PUBLIC_SHEET_API_URL || '';
};

export const setStoredScriptUrl = (url: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SCRIPT_URL_STORAGE_KEY, url.trim());
};

/**
 * Test if the Google Apps Script Web App is reachable
 */
export const testAppsScriptConnection = async (url: string): Promise<{ success: boolean; message: string }> => {
  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'Invalid URL. Must start with https://script.google.com' };
  }

  try {
    const testUrl = url.includes('?') ? `${url}&action=ping` : `${url}?action=ping`;
    const res = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return { success: false, message: `Server returned HTTP ${res.status}` };
    }

    const json = await res.json();
    if (json.status === 'success') {
      return { success: true, message: json.message || 'Connected to Google Sheets successfully!' };
    }
    return { success: false, message: json.message || 'Unknown response from script' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Failed to connect: ${errorMsg}. Make sure 'Who has access' is set to 'Anyone' in Apps Script deployment.`,
    };
  }
};

/**
 * Fetch all transactions and accounts from Google Sheet
 */
export const fetchFromGoogleSheet = async (url: string): Promise<SheetDataResponse | null> => {
  if (!url) return null;

  try {
    const fetchUrl = url.includes('?') ? `${url}&action=getTransactions` : `${url}?action=getTransactions`;
    const res = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result: ApiResponse<SheetDataResponse> = await res.json();
    if (result.status === 'success' && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.warn('Error fetching from Google Sheet, fallback to local storage:', error);
    return null;
  }
};

/**
 * Add a new transaction to Google Sheet
 */
export const addTransactionToSheet = async (
  url: string,
  transaction: Omit<Transaction, 'createdAt'> & { id?: string }
): Promise<Transaction | null> => {
  if (!url) return null;

  try {
    const payload = {
      action: 'addTransaction',
      ...transaction,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result: ApiResponse<Transaction> = await res.json();
    if (result.status === 'success' && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Error adding transaction to Google Sheet:', error);
    return null;
  }
};

/**
 * Delete a transaction from Google Sheet
 */
export const deleteTransactionFromSheet = async (url: string, id: string): Promise<boolean> => {
  if (!url) return false;

  try {
    // Try via POST first
    const payload = {
      action: 'deleteTransaction',
      id: id,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const result: ApiResponse = await res.json();
      return result.status === 'success';
    }

    // Fallback to GET action
    const deleteUrl = url.includes('?') 
      ? `${url}&action=deleteTransaction&id=${encodeURIComponent(id)}`
      : `${url}?action=deleteTransaction&id=${encodeURIComponent(id)}`;
    const getRes = await fetch(deleteUrl);
    const getJson: ApiResponse = await getRes.json();
    return getJson.status === 'success';
  } catch (error) {
    console.error('Error deleting transaction from Google Sheet:', error);
    return false;
  }
};

/**
 * Transfer funds between accounts in Google Sheet
 */
export const transferBetweenAccountsInSheet = async (
  url: string,
  transferData: {
    fromAccount: string;
    toAccount: string;
    amount: number;
    date: string;
    note: string;
  }
): Promise<boolean> => {
  if (!url) return false;

  try {
    const payload = {
      action: 'transfer',
      ...transferData,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const result: ApiResponse = await res.json();
    return result.status === 'success';
  } catch (error) {
    console.error('Error recording transfer in Google Sheet:', error);
    return false;
  }
};

/**
 * Sync entire accounts / payment modes list to Google Sheet
 */
export const syncAccountsToSheet = async (
  url: string,
  accounts: Account[],
  renameOptions?: { oldName?: string; newName?: string }
): Promise<boolean> => {
  if (!url) return false;

  try {
    const payload = {
      action: 'saveAccounts',
      accounts: accounts,
      oldName: renameOptions?.oldName,
      newName: renameOptions?.newName,
    };

    console.log('[syncAccounts] Sending payload:', JSON.stringify(payload));

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    console.log('[syncAccounts] Response status:', res.status, res.statusText);

    const rawText = await res.text();
    console.log('[syncAccounts] Raw response:', rawText);

    let result: ApiResponse;
    try {
      result = JSON.parse(rawText);
    } catch {
      console.error('[syncAccounts] Failed to parse JSON:', rawText);
      return false;
    }

    console.log('[syncAccounts] Parsed result:', result);
    return result.status === 'success';
  } catch (error) {
    console.error('[syncAccounts] Network/fetch error:', error);
    return false;
  }
};
