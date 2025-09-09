import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navBar/navBar";

function MainLayout() {
  return (
    <div className="flex min-h-screen h-full w-screen">
      <Sidebar />
      <div className="flex flex-col w-full">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
