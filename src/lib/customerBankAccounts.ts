// Mock per-customer saved bank beneficiaries store (sessionStorage-backed).

export type CustomerBankAccount = {
  id: string;
  bankName: string;
  accountNumber: string; // full 10-digit
  holderName: string;
  addedAt: string; // ISO
};

const KEY = "cc_customer_bank_accounts_v1";
const EVENT = "cc:customer-bank-accounts-updated";

export const NIGERIAN_BANKS = [
  "GTBank", "UBA", "Zenith Bank", "Ecobank", "Opay", "Moniepoint MFB",
  "First Bank", "Access Bank", "Kuda", "PalmPay", "FCMB", "Sterling Bank",
];

const HOLDER_POOL = [
  "JOHN ADEBAYO DOE", "AISHA MOHAMMED", "CHIDI OKAFOR", "TUNDE ADEYEMI",
  "NGOZI EZE", "SAMUEL OBORO", "BLESSING UGO", "MICHAEL AKINWALE",
];

const DEFAULT_SEED = (alias: string): CustomerBankAccount[] => {
  const h = Array.from(alias).reduce((a, c) => a + c.charCodeAt(0), 0);
  return [
    { id: `${alias}-1`, bankName: NIGERIAN_BANKS[h % NIGERIAN_BANKS.length], accountNumber: String(1000000000 + (h * 7919) % 8999999999).slice(0, 10), holderName: HOLDER_POOL[h % HOLDER_POOL.length], addedAt: new Date(Date.now() - 30 * 86400000).toISOString() },
    { id: `${alias}-2`, bankName: NIGERIAN_BANKS[(h + 3) % NIGERIAN_BANKS.length], accountNumber: String(1000000000 + (h * 31337) % 8999999999).slice(0, 10), holderName: HOLDER_POOL[h % HOLDER_POOL.length], addedAt: new Date(Date.now() - 12 * 86400000).toISOString() },
    { id: `${alias}-3`, bankName: NIGERIAN_BANKS[(h + 5) % NIGERIAN_BANKS.length], accountNumber: String(1000000000 + (h * 2777) % 8999999999).slice(0, 10), holderName: HOLDER_POOL[(h + 2) % HOLDER_POOL.length], addedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  ];
};

function readAll(): Record<string, CustomerBankAccount[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function writeAll(m: Record<string, CustomerBankAccount[]>) {
  sessionStorage.setItem(KEY, JSON.stringify(m));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function listBankAccounts(alias: string): CustomerBankAccount[] {
  const all = readAll();
  if (!all[alias]) {
    all[alias] = DEFAULT_SEED(alias);
    writeAll(all);
  }
  return all[alias];
}

export function addBankAccount(alias: string, acc: Omit<CustomerBankAccount, "id" | "addedAt">): CustomerBankAccount {
  const all = readAll();
  const created: CustomerBankAccount = { ...acc, id: `${alias}-${Date.now().toString(36)}`, addedAt: new Date().toISOString() };
  all[alias] = [created, ...(all[alias] || DEFAULT_SEED(alias))];
  writeAll(all);
  return created;
}

export function removeBankAccount(alias: string, id: string) {
  const all = readAll();
  all[alias] = (all[alias] || []).filter((a) => a.id !== id);
  writeAll(all);
}

export function onBankAccountsChange(cb: () => void): () => void {
  const h = () => cb();
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

// Mock verification — returns a deterministic name for the account number.
export function mockVerifyAccount(accountNumber: string, bankName: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const h = Array.from(accountNumber + bankName).reduce((a, c) => a + c.charCodeAt(0), 0);
      resolve(HOLDER_POOL[h % HOLDER_POOL.length]);
    }, 800);
  });
}
