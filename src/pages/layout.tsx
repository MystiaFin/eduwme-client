import React from 'react';
import { Outlet } from 'react-router-dom';
import Home from '../component/home';

const HomeLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Home />
      <Outlet />
    </div>
  );
};

export default HomeLayout;
