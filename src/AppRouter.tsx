import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { ManagementOverview } from './pages/ManagementOverview';
export const AppRouter: React.FC = () => {
  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagementOverview />} />
        <Route path="/citizens" element={<App />} />
      </Routes>
    </BrowserRouter>;
};