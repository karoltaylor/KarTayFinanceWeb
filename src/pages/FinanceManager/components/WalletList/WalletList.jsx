import React from 'react';
import WalletCard from '../WalletCard/WalletCard';
import styles from './WalletList.module.css';

export default function WalletList({ 
  wallets, 
  selectedWalletId, 
  onSelectWallet, 
  onRemoveWallet 
}) {
  return (
    <div className={styles.walletList}>
      {wallets.map(wallet => (
        <WalletCard
          key={wallet.id}
          wallet={wallet}
          isSelected={selectedWalletId === wallet.id}
          onSelect={() => onSelectWallet(wallet.id)}
          onRemove={() => {
            onRemoveWallet(wallet.id);
            if (selectedWalletId === wallet.id) {
              onSelectWallet(null);
            }
          }}
        />
      ))}
    </div>
  );
}
