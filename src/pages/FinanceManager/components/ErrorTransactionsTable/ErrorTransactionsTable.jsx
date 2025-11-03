import React from 'react';
import styles from './ErrorTransactionsTable.module.css';

export default function ErrorTransactionsTable({ errors }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.errorIcon}>⚠️</span>
          Failed Transactions ({errors.length})
        </h3>
        <p className={styles.subtitle}>
          The following transactions could not be processed
        </p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Row</th>
              <th>Date</th>
              <th>Asset</th>
              <th>Type</th>
              <th>Volume</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error, index) => (
              <tr key={index}>
                <td className={styles.rowNumber}>
                  {error.row_number || index + 1}
                </td>
                <td>{error.data?.date || error.date || '-'}</td>
                <td>{error.data?.asset_name || error.asset_name || '-'}</td>
                <td>
                  <span className={styles.typeBadge}>
                    {error.data?.transaction_type || error.transaction_type || '-'}
                  </span>
                </td>
                <td className={styles.number}>
                  {error.data?.volume?.toFixed(4) || error.volume?.toFixed(4) || '-'}
                </td>
                <td className={styles.number}>
                  {error.data?.item_price?.toFixed(2) || error.item_price?.toFixed(2) || '-'}
                </td>
                <td className={styles.number}>
                  {error.data?.transaction_amount?.toFixed(2) || error.transaction_amount?.toFixed(2) || '-'}
                </td>
                <td className={styles.errorMessage}>
                  <span className={styles.errorText}>
                    {error.error || error.error_message || 'Unknown error'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

