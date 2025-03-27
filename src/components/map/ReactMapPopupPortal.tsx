
import React from 'react';
import { createRoot } from 'react-dom/client';

// This utility helps render React components into map popups
export const renderToPortal = (element: React.ReactNode, container: HTMLElement) => {
  const root = createRoot(container);
  root.render(element);
  return {
    unmount: () => root.unmount()
  };
};
