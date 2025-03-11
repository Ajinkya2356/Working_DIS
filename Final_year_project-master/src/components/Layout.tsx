// src/components/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
const Layout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Layout;