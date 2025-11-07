// AppRouter.tsx CBC_PlanningDashBoard
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App } from './App';
import { ManagementOverview } from './pages/ManagementOverview';
export const AppRouter: React.FC = () => {
  return <BrowserRouter basename="/CBC_PlanningDashBoard">
      <Routes>
        <Route path="/management" element={<ManagementOverview />} />
        <Route path="/" element={<App />} />
        {/* catch-all to avoid blanks on unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>;
};