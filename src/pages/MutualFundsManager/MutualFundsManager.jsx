import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMutualFunds, pushMutualFundValue } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { X, TrendingUp, Save, RefreshCw } from 'lucide-react';
import styles from './MutualFundsManager.module.css';

export default function MutualFundsManager({ onClose }) {
  const { backendUser } = useAuth();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [savingFundId, setSavingFundId] = useState(null);
  const [fundValues, setFundValues] = useState({}); // Store input values for each fund

  useEffect(() => {
    if (backendUser) {
      fetchMutualFunds();
    }
  }, [backendUser]);

  const fetchMutualFunds = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📥 Fetching mutual funds...');
      const response = await getMutualFunds();
      console.log('✅ Mutual funds fetched:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', response ? Object.keys(response) : 'null');
      
      // Handle different response formats
      const fundsData = Array.isArray(response) ? response : (response?.funds || response?.data || []);
      
      console.log('💼 Processed funds data:', fundsData);
      console.log('💼 Funds count:', fundsData.length);
      
      setFunds(fundsData);
      
      // Initialize fund values with current values
      const initialValues = {};
      fundsData.forEach(fund => {
        initialValues[fund.id || fund._id] = fund.current_value || '';
      });
      setFundValues(initialValues);
      
    } catch (error) {
      console.error('❌ Error fetching mutual funds:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setError(`Failed to load mutual funds: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (fundId, value) => {
    setFundValues(prev => ({
      ...prev,
      [fundId]: value
    }));
  };

  const handleSaveValue = async (fundId) => {
    const value = fundValues[fundId];
    
    // Validate input
    if (!value || isNaN(parseFloat(value))) {
      setError('Please enter a valid number');
      return;
    }

    setSavingFundId(fundId);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const valueData = {
        current_value: parseFloat(value),
        date: new Date().toISOString()
      };
      
      console.log('💾 Saving value for fund:', fundId, valueData);
      const result = await pushMutualFundValue(fundId, valueData);
      console.log('✅ Value saved:', result);
      
      setSuccessMessage(`Value updated successfully for fund ${fundId}`);
      
      // Refresh the funds list to show updated values
      await fetchMutualFunds();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error('❌ Error saving value:', error);
      setError(`Failed to save value: ${error.message}`);
    } finally {
      setSavingFundId(null);
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <TrendingUp size={24} className={styles.headerIcon} />
            <h2 className={styles.title}>Mutual Funds Manager</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button onClick={() => setError(null)} className={styles.dismissButton}>✕</button>
          </div>
        )}

        {successMessage && (
          <div className={styles.successBanner}>
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className={styles.dismissButton}>✕</button>
          </div>
        )}

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
            </div>
          ) : funds.length === 0 ? (
            <div className={styles.emptyState}>
              <TrendingUp size={48} className={styles.emptyIcon} />
              <h3>No Mutual Funds Found</h3>
              <p>You don't have any mutual funds yet. Add some funds to start tracking their values.</p>
            </div>
          ) : (
            <div className={styles.fundsGrid}>
              {funds.map((fund) => {
                const fundId = fund.id || fund._id;
                const isSaving = savingFundId === fundId;
                
                return (
                  <div key={fundId} className={styles.fundCard}>
                    <div className={styles.fundHeader}>
                      <h3 className={styles.fundName}>{fund.name || 'Unnamed Fund'}</h3>
                      {fund.symbol && (
                        <span className={styles.fundSymbol}>{fund.symbol}</span>
                      )}
                    </div>

                    <div className={styles.fundInfo}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Current Value:</span>
                        <span className={styles.infoValue}>
                          {formatCurrency(fund.current_value)}
                        </span>
                      </div>
                      
                      {fund.total_invested !== undefined && (
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Total Invested:</span>
                          <span className={styles.infoValue}>
                            {formatCurrency(fund.total_invested)}
                          </span>
                        </div>
                      )}
                      
                      {fund.current_value !== undefined && fund.total_invested !== undefined && (
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Return:</span>
                          <span className={`${styles.infoValue} ${
                            fund.current_value >= fund.total_invested 
                              ? styles.positive 
                              : styles.negative
                          }`}>
                            {formatCurrency(fund.current_value - fund.total_invested)}
                            {' '}
                            ({fund.total_invested > 0 
                              ? ((fund.current_value - fund.total_invested) / fund.total_invested * 100).toFixed(2)
                              : 0}%)
                          </span>
                        </div>
                      )}
                      
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Last Updated:</span>
                        <span className={styles.infoValue}>
                          {formatDate(fund.last_updated || fund.updated_at)}
                        </span>
                      </div>
                    </div>

                    <div className={styles.inputSection}>
                      <label htmlFor={`value-${fundId}`} className={styles.inputLabel}>
                        Update Current Value:
                      </label>
                      <div className={styles.inputGroup}>
                        <input
                          id={`value-${fundId}`}
                          type="number"
                          step="0.01"
                          placeholder="Enter current value"
                          value={fundValues[fundId] || ''}
                          onChange={(e) => handleValueChange(fundId, e.target.value)}
                          className={styles.input}
                          disabled={isSaving}
                        />
                        <button
                          onClick={() => handleSaveValue(fundId)}
                          className={styles.saveButton}
                          disabled={isSaving || !fundValues[fundId]}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw size={16} className={styles.spinning} />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={fetchMutualFunds} className={styles.refreshButton} disabled={loading}>
            <RefreshCw size={16} className={loading ? styles.spinning : ''} />
            Refresh
          </button>
          <button onClick={onClose} className={styles.closeFooterButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

