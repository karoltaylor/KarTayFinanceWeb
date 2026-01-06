import React, { useState, useRef } from 'react';
import { Upload, Sparkles, FileSpreadsheet, ChevronDown, AlertCircle } from 'lucide-react';
import { ACCEPTED_FILE_TYPES } from '../../constants/constants';
import styles from './TransactionUploadPane.module.css';

const UPLOAD_MODES = {
  PREDEFINED: 'predefined',
  AI_TRANSFORM: 'ai_transform'
};

export default function TransactionUploadPane({ 
  wallets, 
  onUpload, 
  onAITransformUpload,
  loading = false 
}) {
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [uploadMode, setUploadMode] = useState(UPLOAD_MODES.PREDEFINED);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleFile = (file) => {
    setError(null);
    
    if (!selectedWalletId) {
      setError('Please select a wallet first');
      return;
    }

    if (!validateFile(file)) {
      setError('Invalid file type. Please upload CSV, XLS, or XLSX files.');
      return;
    }

    if (uploadMode === UPLOAD_MODES.AI_TRANSFORM) {
      onAITransformUpload?.(selectedWalletId, file);
    } else {
      onUpload?.(selectedWalletId, file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleButtonClick = () => {
    if (!selectedWalletId) {
      setError('Please select a wallet first');
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Upload className={styles.headerIcon} size={24} />
        <div>
          <h3 className={styles.title}>Upload Transactions</h3>
          <p className={styles.subtitle}>Import your financial data</p>
        </div>
      </div>

      {/* Wallet Selector */}
      <div className={styles.walletSelector}>
        <label className={styles.label}>Select Wallet</label>
        <div className={styles.selectWrapper}>
          <select
            value={selectedWalletId}
            onChange={(e) => {
              setSelectedWalletId(e.target.value);
              setError(null);
            }}
            className={styles.select}
            disabled={loading}
          >
            <option value="">Choose a wallet...</option>
            {wallets.map(wallet => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
          <ChevronDown className={styles.selectIcon} size={18} />
        </div>
      </div>

      {/* Upload Mode Toggle */}
      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeButton} ${uploadMode === UPLOAD_MODES.PREDEFINED ? styles.modeActive : ''}`}
          onClick={() => setUploadMode(UPLOAD_MODES.PREDEFINED)}
          disabled={loading}
        >
          <FileSpreadsheet size={18} />
          <span>Predefined Format</span>
        </button>
        <button
          className={`${styles.modeButton} ${uploadMode === UPLOAD_MODES.AI_TRANSFORM ? styles.modeActive : ''}`}
          onClick={() => setUploadMode(UPLOAD_MODES.AI_TRANSFORM)}
          disabled={loading}
        >
          <Sparkles size={18} />
          <span>AI Transform</span>
        </button>
      </div>

      {/* Mode Description */}
      <div className={styles.modeDescription}>
        {uploadMode === UPLOAD_MODES.PREDEFINED ? (
          <p>Upload a file in the standard transaction format. Columns should include: date, asset_name, transaction_type, volume, price, amount.</p>
        ) : (
          <p>Upload any file format and let AI automatically detect and transform your data into the required format.</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ''} ${loading ? styles.dropZoneDisabled : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleChange}
          className={styles.fileInput}
          disabled={loading}
        />
        
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Processing...</span>
          </div>
        ) : (
          <>
            <div className={styles.dropIcon}>
              {uploadMode === UPLOAD_MODES.AI_TRANSFORM ? (
                <Sparkles size={32} />
              ) : (
                <Upload size={32} />
              )}
            </div>
            <p className={styles.dropText}>
              {dragActive ? 'Drop file here' : 'Drag & drop or click to browse'}
            </p>
            <p className={styles.dropHint}>
              Supports CSV, XLS, and XLSX files
            </p>
          </>
        )}
      </div>

      {/* Selected Wallet Info */}
      {selectedWallet && (
        <div className={styles.selectedInfo}>
          <span>Uploading to:</span>
          <strong>{selectedWallet.name}</strong>
        </div>
      )}
    </div>
  );
}

