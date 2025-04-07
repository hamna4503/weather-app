import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // For icons
import logo from "../../assets/logo.png";
const navLinks = [
  { name: "Dashboard", path: "/" },
  { name: "Weather Report", path: "/weather/" },
  { name: "Predictions", path: "/weather/predictions" },
  { name: "Temperature", path: "/temperature" },
  { name: "Humidity", path: "/humidity" },
  { name: "Air Quality", path: "/airquality" },
  { name: "Settings", path: "/settings" },
  { name: "Messages", path: "/messages" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={` bg-gray-900  text-white h-full p-5 w-64 transition-all ${
          isOpen ? "block" : "hidden"
        } md:block`}
      >
        {/* Logo */}
        <div className="text-2xl font-bold  flex justify-center items-center flex-col mb-14">
          <img src={logo} className="w-20 h-20" />
          <p>Weather App</p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-3">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="block px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to={"/logout"}
            className="block px-4 py-2 mt-28 rounded-md hover:bg-gray-700 transition"
          >
            Logout
          </Link>
        </nav>
      </div>

      {/* Toggle Button */}
      <button
        className="absolute top-4 left-4 md:hidden text-gray-900 bg-gray-200 p-2 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}
