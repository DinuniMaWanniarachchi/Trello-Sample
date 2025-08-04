// components/Layout.tsx
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '1rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1>My App</h1>
        {/* You can add navigation links here */}
      </header>

      <main>{children}</main>

      <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
        © {new Date().getFullYear()} My Company
      </footer>
    </div>
  );
}
