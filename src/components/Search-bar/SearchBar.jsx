
// import React, { useState, useEffect } from "react";
// import "./SearchBar.css";

// const employees = ["EMP1234", "EMP5678", "EMP9101", "EMP2345", "EMP2789"]; // Replace with real data

// const Navbar = ({ onSearch }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredEmployees, setFilteredEmployees] = useState([]);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showDropdown, setShowDropdown] = useState(false);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (!event.target.closest(".search-container")) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   const validateInput = (value) => /^EMP\d{4}$/.test(value);

//   const handleSearchChange = (e) => {
//     const value = e.target.value.toUpperCase();
//     setSearchTerm(value);
//     if (typeof onSearch === "function") {
//       onSearch("");
//     }
//     if (value === "") {
//       setFilteredEmployees([]);
//       setShowDropdown(true);
//       setErrorMessage("");
//       return;
//     }
//     if (!validateInput(value) && value.length >= 7) {
//       setErrorMessage("Invalid Employee ID. Use EMPXXXX.");
//       setFilteredEmployees([]);
//       setShowDropdown(false);
//       return;
//     }
//     setErrorMessage("");
//     const filtered = employees.filter((emp) => emp.startsWith(value));
//     setFilteredEmployees(filtered);
//     setShowDropdown(filtered.length > 0);
//   };

//   const handleSelectEmployee = (emp) => {
//     setSearchTerm(emp);
//     setShowDropdown(false);
//     setErrorMessage("");

//     if (typeof onSearch === "function") {
//       onSearch(emp);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       // If valid ID and it exists in the list
//       if (validateInput(searchTerm) && employees.includes(searchTerm)) {
//         setErrorMessage("");
//         if (typeof onSearch === "function") {
//           onSearch(searchTerm);
//         }
//         setShowDropdown(false);
//       } else {
//         setErrorMessage("Invalid Employee ID.");
//       }
//     }
//   };

//   return (
//     <nav>
//       <div className="search-container">
//         <input
//           type="text"
//           className="search-bar"
//           placeholder="Search Employee ID..."
//           value={searchTerm}
//           onChange={handleSearchChange}
//           onFocus={() => setShowDropdown(false)}
//           onKeyDown={handleKeyDown}
//         />
//         {errorMessage && <p className="error-message">{errorMessage}</p>}
//         {showDropdown && (
//           <ul className="dropdown">
//             {filteredEmployees.map((emp) => (
//               <li key={emp} onClick={() => handleSelectEmployee(emp)}>
//                 {emp}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
import React, { useState, useEffect } from "react";
import "./SearchBar.css";

const employees = ["EMP1234", "EMP5678", "EMP9101", "EMP2345", "EMP2789"]; // Replace with real data

const Navbar = ({ onSearch, clearSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (clearSearch) {
      setSearchTerm(""); // Clear the search bar when an employee is selected
    }
  }, [clearSearch]);

  const validateInput = (value) => /^EMP\d{4}$/.test(value);

  const handleSearchChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchTerm(value);

    // Reset selection when typing
    if (typeof onSearch === "function") {
      onSearch("");
    }

    if (value === "") {
      setFilteredEmployees([]);
      setShowDropdown(false);
      setErrorMessage("");
      return;
    }

    if (!validateInput(value) && value.length >= 7) {
      setErrorMessage("Invalid Employee ID. Use EMPXXXX.");
      setFilteredEmployees([]);
      setShowDropdown(false);
      return;
    }

    setErrorMessage("");
    const filtered = employees.filter((emp) => emp.startsWith(value));
    setFilteredEmployees(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const handleSelectEmployee = (emp) => {
    setSearchTerm(""); // Clear the search field after selection
    setShowDropdown(false);
    setErrorMessage("");

    if (typeof onSearch === "function") {
      onSearch(emp);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (validateInput(searchTerm) && employees.includes(searchTerm)) {
        setErrorMessage("");
        if (typeof onSearch === "function") {
          onSearch(searchTerm);
        }
        setSearchTerm(""); // Clear the search bar after pressing Enter
        setShowDropdown(false);
      } else {
        setErrorMessage("Invalid Employee ID.");
      }
    }
  };

  return (
    <nav>
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search Employee ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {showDropdown && (
          <ul className="dropdown">
            {filteredEmployees.map((emp) => (
              <li key={emp} onClick={() => handleSelectEmployee(emp)}>
                {emp}
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
