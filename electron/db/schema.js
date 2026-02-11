// electron/db/schema.js
const SQL_SCHEMA = {
  // Wallets table
  wallets: `
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT UNIQUE NOT NULL,
      encrypted_private_key TEXT NOT NULL,
      encrypted_mnemonic TEXT,
      derivation_path TEXT,
      group_id TEXT,
      tags TEXT DEFAULT '[]',
      metadata TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (group_id) REFERENCES wallet_groups(id) ON DELETE SET NULL
    )
  `,

  // Wallet groups/folders
  walletGroups: `
    CREATE TABLE IF NOT EXISTS wallet_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      icon TEXT,
      parent_id TEXT,
      metadata TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (parent_id) REFERENCES wallet_groups(id) ON DELETE CASCADE
    )
  `,

  // RPC endpoints
  rpcEndpoints: `
    CREATE TABLE IF NOT EXISTS rpc_endpoints (
      id TEXT PRIMARY KEY,
      chain_id INTEGER NOT NULL,
      chain_name TEXT NOT NULL,
      url TEXT NOT NULL,
      name TEXT,
      is_active INTEGER DEFAULT 1,
      priority INTEGER DEFAULT 0,
      health_status TEXT DEFAULT 'unknown',
      last_check INTEGER,
      latency INTEGER,
      metadata TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(chain_id, url)
    )
  `,

  // Proxies
  proxies: `
    CREATE TABLE IF NOT EXISTS proxies (
      id TEXT PRIMARY KEY,
      protocol TEXT NOT NULL CHECK(protocol IN ('http', 'https', 'socks5')),
      host TEXT NOT NULL,
      port INTEGER NOT NULL,
      username TEXT,
      password TEXT,
      is_active INTEGER DEFAULT 1,
      health_status TEXT DEFAULT 'unknown',
      last_check INTEGER,
      latency INTEGER,
      metadata TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      UNIQUE(protocol, host, port)
    )
  `,

  // Tasks
  tasks: `
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('mint', 'claim', 'transfer', 'custom')),
      status TEXT DEFAULT 'idle' CHECK(status IN ('idle', 'monitoring', 'executing', 'paused', 'completed', 'failed')),
      contract_address TEXT NOT NULL,
      chain_id INTEGER NOT NULL,
      wallet_group_id TEXT,
      rpc_group_id TEXT,
      gas_mode TEXT DEFAULT 'auto',
      gas_limit TEXT,
      gas_price TEXT,
      max_priority_fee TEXT,
      mint_price TEXT,
      mint_quantity INTEGER DEFAULT 1,
      max_retries INTEGER DEFAULT 3,
      retry_delay INTEGER DEFAULT 5000,
      schedule_timestamp INTEGER,
      calldata TEXT,
      metadata TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (wallet_group_id) REFERENCES wallet_groups(id) ON DELETE SET NULL
    )
  `,

  // Task executions (per-wallet logs)
  taskExecutions: `
    CREATE TABLE IF NOT EXISTS task_executions (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      wallet_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'executing', 'success', 'failed', 'skipped')),
      transaction_hash TEXT,
      block_number INTEGER,
      gas_used TEXT,
      gas_price TEXT,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      started_at INTEGER,
      completed_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
    )
  `,

  // NFT holdings
  nftHoldings: `
    CREATE TABLE IF NOT EXISTS nft_holdings (
      id TEXT PRIMARY KEY,
      wallet_id TEXT NOT NULL,
      chain_id INTEGER NOT NULL,
      contract_address TEXT NOT NULL,
      token_id TEXT NOT NULL,
      token_type TEXT CHECK(token_type IN ('ERC721', 'ERC1155')),
      quantity INTEGER DEFAULT 1,
      metadata TEXT DEFAULT '{}',
      is_spam INTEGER DEFAULT 0,
      last_synced INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
      UNIQUE(wallet_id, chain_id, contract_address, token_id)
    )
  `,

  // Captcha solver config
  captchaSolvers: `
    CREATE TABLE IF NOT EXISTS captcha_solvers (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL CHECK(provider IN ('capsolver', '2captcha', 'anticaptcha', 'hcaptcha')),
      api_key TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      balance REAL,
      last_check INTEGER,
      metadata TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `,

  // Application settings
  settings: `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'string',
      updated_at INTEGER NOT NULL
    )
  `,

  // Transaction history
  transactions: `
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      wallet_id TEXT NOT NULL,
      chain_id INTEGER NOT NULL,
      hash TEXT UNIQUE NOT NULL,
      from_address TEXT NOT NULL,
      to_address TEXT,
      value TEXT DEFAULT '0',
      data TEXT,
      gas_limit TEXT,
      gas_price TEXT,
      max_priority_fee TEXT,
      max_fee_per_gas TEXT,
      nonce INTEGER,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'failed')),
      block_number INTEGER,
      block_timestamp INTEGER,
      gas_used TEXT,
      error_message TEXT,
      metadata TEXT DEFAULT '{}',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
    )
  `
};

// Indexes for performance
const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address)',
  'CREATE INDEX IF NOT EXISTS idx_wallets_group ON wallets(group_id)',
  'CREATE INDEX IF NOT EXISTS idx_rpc_chain ON rpc_endpoints(chain_id)',
  'CREATE INDEX IF NOT EXISTS idx_rpc_active ON rpc_endpoints(is_active)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
  'CREATE INDEX IF NOT EXISTS idx_task_executions_task ON task_executions(task_id)',
  'CREATE INDEX IF NOT EXISTS idx_task_executions_wallet ON task_executions(wallet_id)',
  'CREATE INDEX IF NOT EXISTS idx_task_executions_status ON task_executions(status)',
  'CREATE INDEX IF NOT EXISTS idx_nft_holdings_wallet ON nft_holdings(wallet_id)',
  'CREATE INDEX IF NOT EXISTS idx_nft_holdings_contract ON nft_holdings(contract_address)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet_id)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash)',
  'CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)'
];

module.exports = {
  SQL_SCHEMA,
  INDEXES
};