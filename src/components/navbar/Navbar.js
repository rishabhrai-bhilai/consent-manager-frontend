import React from "react";
import "../navbar/navbar.css";
import useColorMode from "../../hooks/useColorMode";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { clearPrivateKey } from "../../utils/cryptoUtils"; // Import clearPrivateKey

const navLinks = {
  admin: [
    { name: "Dashboard", path: "/admin/dashboard", icon: "bx-home-alt" },
    { name: "History", path: "/history", icon: "bx-history" },
  ],
  provider: [
    { name: "Dashboard", path: "/individual/dashboard", icon: "bx-home-alt" },
    { name: "Documents", path: "/documents", icon: "bx-file" },
    { name: "Notification", path: "/notification", icon: "bx-bell" },
    { name: "History", path: "/history", icon: "bx-history" },
  ],
  seeker: [
    { name: "Dashboard", path: "/requestor/dashboard", icon: "bx-home-alt" },
    { name: "Seek Consent", path: "/requestor/request", icon: "bx-user-plus" },
    { name: "History", path: "/requestor/history", icon: "bx-history" },
  ],
};

export const Navbar = ({ role, isClosed, toggleSidebar }) => {
  const [colorMode, setColorMode] = useColorMode();
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleModeSwitch = () => {
    setColorMode(colorMode === "light" ? "dark" : "light");
    const body = document.querySelector("body");
    const modeText = document.querySelector(".mode-text");
    modeText.innerText = body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
  };

  const handleLogout = async () => {
    if (auth?.user) {
      await clearPrivateKey(auth.user); // Clear private key from IndexedDB
    }

    logout();
    navigate("/login", { replace: true });
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenuOnOutsideClick = (e) => {
    if (isOpen && !e.target.closest("aside") && !e.target.closest("nav")) {
      toggleMenu();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", closeMenuOnOutsideClick);
    } else {
      document.removeEventListener("click", closeMenuOnOutsideClick);
    }
    return () => document.removeEventListener("click", closeMenuOnOutsideClick);
  }, [isOpen]);

  const links = navLinks[role] || [];

  return (
    <div className="md:flex">
      <nav className="md:hidden fixed top-4 right-4 z-50">
        <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
          <i className={`bx ${isOpen ? "bx-x" : "bx-menu"} text-3xl`}></i>
        </button>
      </nav>

      <aside
        className={`sidebar ${isClosed ? "close" : ""} bg-gray-100 text-gray-700 w-3/4 fixed top-0 md:top-0 md:left-0 md:static transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition duration-200 ease-in-out z-40`}
      >
        <header className="relative">
          <div className="flex items-center w-full px-3 mt-3">
            <svg
              className="w-8 h-8 fill-current flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
            </svg>
            <span
              className={`ml-2 text-sm font-bold transition-opacity duration-200 ${
                isClosed ? "opacity-0" : "opacity-100"
              }`}
            >
              GuardianVault
            </span>
          </div>
          <i
            className="bx bx-chevron-right toggle bg-blue-600 text-white hidden md:block"
            onClick={toggleSidebar}
          ></i>
        </header>

        <div className="menu-bar">
          <div className="menu">
            <ul className="menu-links">
              {links.map((link) => (
                <li key={link.name} className="nav-link">
                  <Link
                    to={link.path}
                    className="flex items-center w-full h-full rounded hover:bg-gray-300"
                    onClick={() => {
                      if (isOpen) toggleMenu();
                    }}
                  >
                    <i className={`bx ${link.icon} icon`}></i>
                    <span className="text nav-text">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bottom-content">
            <li className="nav-link" onClick={handleLogout}>
              <Link
                to="#"
                className="flex items-center w-full h-full rounded hover:bg-gray-300"
              >
                <i className="bx bx-log-out icon"></i>
                <span className="text nav-text">Logout</span>
              </Link>
            </li>
            <li className="mode" onClick={handleModeSwitch}>
              <div className="moon-sun">
                <i className="bx bx-moon icon moon"></i>
                <i className="bx bx-sun icon sun"></i>
              </div>
              <span className="mode-text text">
                {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
              <div className="toggle-switch">
                <span className="switch"></span>
              </div>
            </li>
          </div>
        </div>
      </aside>
    </div>
  );
};