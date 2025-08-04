"use client";
import React, { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if i18n is ready
    const checkReady = () => {
      if (i18n.isInitialized) {
        setIsReady(true);
      } else {
        setTimeout(checkReady, 50);
      }
    };
    checkReady();
  }, []);

  if (!isReady) {
    return null; // or a loading spinner
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
