import React from 'react';
import { Upload } from 'lucide-react';
import { ACCEPTED_FILE_TYPES } from '../../constants/constants';
import styles from './FileUploader.module.css';

export default function FileUploader({ onFileUpload }) {
  const handleChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
      event.target.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.uploadArea}>
        <Upload size={24} />
        <span className={styles.text}>Upload Transactions</span>
        <input
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleChange}
          className={styles.input}
        />
      </label>
      <p className={styles.hint}>Supports CSV, XLS or XLSX</p>
    </div>
  );
}
