import React from "react";
import { Bell } from "lucide-react"; // Notification Icon

export default function Navbar() {
  return (
    <nav className="min-w-full bg-gray-900 text-white px-6 py-4 flex justify-between items-center w-full">
      {/* Empty Space for Center Alignment */}
      <div></div>

      {/* Notification Icon */}
      <div className="ml-auto">
        <Bell
          size={24}
          className="cursor-pointer hover:text-gray-400 transition"
        />
      </div>
    </nav>
  );
}
