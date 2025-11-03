import { describe, it, expect } from 'vitest'
import { 
  calculateStats,
  calculateDepositsAndIncome,
  calculateAllWalletsStats,
  calculateBalanceGrowth,
  getAllAssets
} from './financeUtils'

const mkTx = (overrides = {}) => ({
  id: 't1',
  asset_name: 'AAPL',
  asset_type: 'stock',
  date: '2024-01-15',
  transaction_type: 'BUY',
  volume: 10,
  item_price: 10,
  transaction_amount: -100,
  currency: 'USD',
  fee: 0,
  created_at: '2024-01-15T00:00:00Z',
  ...overrides,
})

describe('financeUtils', () => {
  it('calculateStats computes income and expenses from transaction_amount', () => {
    const txs = [
      mkTx({ transaction_amount: -100 }),
      mkTx({ transaction_amount: 250 })
    ]
    const res = calculateStats(txs)
    expect(res.income).toBe(250)
    expect(res.expenses).toBe(100)
  })

  it('calculateDepositsAndIncome sums BUY as deposits and SELL as income', () => {
    const txs = [
      mkTx({ transaction_type: 'BUY', transaction_amount: -200 }),
      mkTx({ transaction_type: 'SELL', transaction_amount: 300 }),
      mkTx({ transaction_type: 'transfer', transaction_amount: 0 })
    ]
    const res = calculateDepositsAndIncome(txs)
    expect(res.deposits).toBe(200)
    expect(res.income).toBe(300)
  })

  it('calculateAllWalletsStats aggregates across wallets', () => {
    const wallets = [
      { name: 'w1', balance: 1000, transactions: [mkTx({ transaction_amount: -100 })], totalTransactionCount: 1 },
      { name: 'w2', balance: 500, transactions: [mkTx({ transaction_type: 'SELL', transaction_amount: 200 })], totalTransactionCount: 1 }
    ]
    const res = calculateAllWalletsStats(wallets)
    expect(res.totalBalance).toBe(1500)
    expect(res.totalTransactions).toBe(2)
    expect(res.deposits).toBe(100)
    expect(res.income).toBe(200)
  })

  it('calculateBalanceGrowth returns monthly cumulative balance', () => {
    const wallets = [
      { transactions: [
        mkTx({ date: '2024-01-10', transaction_type: 'BUY', transaction_amount: -100 }),
        mkTx({ date: '2024-02-05', transaction_type: 'SELL', transaction_amount: 50 }),
        mkTx({ date: '2024-02-20', transaction_type: 'BUY', transaction_amount: -20 })
      ]}
    ]
    const series = calculateBalanceGrowth(wallets)
    expect(series.length).toBe(2)
    const jan = series.find(d => d.date === '2024-01')
    const feb = series.find(d => d.date === '2024-02')
    expect(jan.balance).toBe(100) // deposits are added as +abs
    expect(feb.balance).toBe(170) // +50 income then +20 deposits => 170
  })

  it('getAllAssets aggregates by asset with volume and wallets', () => {
    const tx1 = mkTx({ asset_name: 'AAPL', asset_type: 'stock', transaction_type: 'BUY', transaction_amount: -120, volume: 3 })
    const tx2 = mkTx({ asset_name: 'AAPL', asset_type: 'stock', transaction_type: 'SELL', transaction_amount: 20, volume: 1 })
    const tx3 = mkTx({ asset_name: 'BTC', asset_type: 'crypto', transaction_type: 'BUY', transaction_amount: -200, volume: 0.01 })
    const wallets = [
      { name: 'w1', transactions: [tx1, tx3] },
      { name: 'w2', transactions: [tx2] }
    ]
    const assets = getAllAssets(wallets)
    const aapl = assets.find(a => a.name === 'AAPL')
    const btc = assets.find(a => a.name === 'BTC')
    expect(aapl.totalDeposits).toBe(120)
    expect(aapl.totalIncome).toBe(20)
    expect(aapl.totalVolume).toBe(2)
    expect(aapl.wallets.sort()).toEqual(['w1','w2'])
    expect(btc.totalDeposits).toBe(200)
  })
})
