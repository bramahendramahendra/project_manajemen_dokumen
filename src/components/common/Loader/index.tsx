// components/Loader.js
import React from 'react';
import styles from './Loader.module.css';

const Loader = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-dark">
      <div className={`${styles.book} relative h-40 w-32`}>
        <div className={`${styles.page} absolute w-full h-full bg-white border border-solid border-[#0C479F] animate-flip delay-0`}></div>
        <div className={`${styles.page} absolute w-full h-full bg-white border border-solid border-[#0C479F] animate-flip delay-200`}></div>
        <div className={`${styles.page} absolute w-full h-full bg-white border border-solid border-[#0C479F] animate-flip delay-400`}></div>
        <div className={`${styles.page} absolute w-full h-full bg-white border border-solid border-[#0C479F] animate-flip delay-600`}></div>
      </div>
    </div>
  );
};

export default Loader;
