import React from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import styles from './AppLayout.module.css';

const AppLayout = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <TopNav />
        <div className={styles.pageContainer}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
