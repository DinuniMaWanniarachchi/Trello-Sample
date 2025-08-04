"use client";

import React, { ReactNode } from 'react';
import '@/i18n'; // initialize i18n on client side

export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}