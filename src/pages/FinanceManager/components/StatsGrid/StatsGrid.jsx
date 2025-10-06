import React from 'react';
import { Wallet, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatsGrid.module.css';

const iconMap = {
  wallet: Wallet,
  calendar: Calendar,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown
};

export default function StatsGrid({ stats, columns = 4 }) {
  const gridClass = columns === 2 ? styles.gridTwoColumns : styles.gridFourColumns;

  return (
    <div className={`${styles.grid} ${gridClass}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon ? iconMap[stat.icon] : null;
        const typeClass = stat.type ? styles[stat.type] : '';

        return (
          <div key={index} className={styles.card}>
            <div className={`${styles.header} ${typeClass}`}>
              {Icon && <Icon size={20} />}
              <span className={styles.label}>{stat.label}</span>
            </div>
            <p className={`${styles.value} ${typeClass}`}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
