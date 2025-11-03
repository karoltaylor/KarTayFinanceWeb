import React from 'react';
import styles from './Pagination.module.css';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalCount, 
  hasNext, 
  hasPrev, 
  onPageChange, 
  loading = false 
}) {
  // Debug logging
  console.log('🔍 Pagination component props:', {
    currentPage,
    totalPages,
    totalCount,
    hasNext,
    hasPrev,
    loading
  });

  if (totalPages <= 1) {
    // Still show pagination info even for single page to display total count
    return (
      <div className={styles.container}>
        <div className={styles.info}>
          <span className={styles.totalCount}>
            Showing {totalCount} total transactions
          </span>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    if (hasPrev && !loading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNext && !loading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push('...');
        }
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <span className={styles.totalCount}>
          Showing {totalCount} total transactions
        </span>
        <span className={styles.pageInfo}>
          Page {currentPage} of {totalPages}
        </span>
      </div>
      
      <div className={styles.controls}>
        <button
          className={`${styles.button} ${styles.prevButton}`}
          onClick={handlePrevious}
          disabled={!hasPrev || loading}
          title="Previous page"
        >
          ← Previous
        </button>
        
        <div className={styles.pageNumbers}>
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              className={`${styles.pageButton} ${
                page === currentPage ? styles.active : ''
              } ${page === '...' ? styles.ellipsis : ''}`}
              onClick={() => typeof page === 'number' && handlePageClick(page)}
              disabled={page === '...' || loading}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          className={`${styles.button} ${styles.nextButton}`}
          onClick={handleNext}
          disabled={!hasNext || loading}
          title="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
