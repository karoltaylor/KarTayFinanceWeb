export const FILE_TYPES = {
  CSV: '.csv',
  JSON: '.json'
};

export const ACCEPTED_FILE_TYPES = `${FILE_TYPES.CSV},${FILE_TYPES.JSON}`;

export const TRANSACTION_CATEGORIES = [
  'General',
  'Food & Dining',
  'Shopping',
  'Entertainment',
  'Transportation',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Income',
  'Other'
];

export const DEFAULT_WALLET = {
  name: 'Personal',
  balance: 0,
  transactions: []
};

export const MESSAGES = {
  NO_WALLETS: 'No wallets yet',
  NO_TRANSACTIONS: 'No transactions yet',
  UPLOAD_ERROR: 'Error loading transactions. Please check file format.',
  CREATE_FIRST_WALLET: 'Create your first wallet to start tracking finances',
  UPLOAD_TO_START: 'Upload a file to get started'
};
