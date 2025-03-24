// import React, { useState ,useEffect} from "react";
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
  
//     if (value === "") {
//       setFilteredEmployees([]);
//       setShowDropdown(true);
//       setErrorMessage("");
//       onSearch(""); 
//       return;
//     }
   
  
//   if (!validateInput(value) && value.length >= 7) {
//       setErrorMessage("Invalid Employee ID. Use EMPXXXX.");
//       setFilteredEmployees([]);
//       setShowDropdown(false);
//       return;
//     }
//   // if (!validateInput(value) && value.length >= 7) {
//   //   setErrorMessage("Invalid Employee ID. Use EMPXXXX.");
//   //   setFilteredEmployees([]);
//   //   setShowDropdown(false);
//   //   onSearch("");  // Ensure graph disappears when input is invalid
//   //   return;
//   // }
  
//     setErrorMessage("");
//     const filtered = employees.filter((emp) => emp.startsWith(value));
//     setFilteredEmployees(filtered);
//     setShowDropdown(filtered.length > 0);
//   };

//   const handleSelectEmployee = (emp) => {
//     setSearchTerm(emp);
//     setShowDropdown(false);
//     setErrorMessage("");
  
//     console.log("Employee Clicked:", emp); // ✅ Debugging Log
//     if (typeof onSearch === "function") {
//       onSearch(emp);
//     }
//   };
  
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       if (validateInput(searchTerm) && employees.includes(searchTerm)) {
//         console.log("Enter Pressed, Employee:", searchTerm); // ✅ Debugging Log
//         if (typeof onSearch === "function") {
//           onSearch(searchTerm);
//         }
//         setShowDropdown(false);
//         setErrorMessage("");
//       } else {
//         setErrorMessage("Invalid Employee ID.");
//       }
//     }
//   };
  


//   return (
//     <nav >
//       <div className="search-container">
       
// <input
//   type="text"
//   className="search-bar"
//   placeholder="Search Employee ID..."
//   value={searchTerm}
//   onChange={handleSearchChange}
//   onFocus={() => setShowDropdown(false)} 
//   onKeyDown={handleKeyDown}
// />

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

const Navbar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const validateInput = (value) => /^EMP\d{4}$/.test(value);

  const handleSearchChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchTerm(value);
    
    // Hide the graph immediately whenever user starts typing something new
    if (typeof onSearch === "function") {
      onSearch("");
    }

    // If input is empty
    if (value === "") {
      setFilteredEmployees([]);
      setShowDropdown(true);
      setErrorMessage("");
      return;
    }

    // If input is already long but invalid
    if (!validateInput(value) && value.length >= 7) {
      setErrorMessage("Invalid Employee ID. Use EMPXXXX.");
      setFilteredEmployees([]);
      setShowDropdown(false);
      return;
    }

    // Otherwise, filter employees for dropdown
    setErrorMessage("");
    const filtered = employees.filter((emp) => emp.startsWith(value));
    setFilteredEmployees(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const handleSelectEmployee = (emp) => {
    setSearchTerm(emp);
    setShowDropdown(false);
    setErrorMessage("");

    // Show the graph again with the selected employee
    if (typeof onSearch === "function") {
      onSearch(emp);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // If valid ID and it exists in the list
      if (validateInput(searchTerm) && employees.includes(searchTerm)) {
        setErrorMessage("");
        if (typeof onSearch === "function") {
          onSearch(searchTerm);
        }
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
          onFocus={() => setShowDropdown(false)}
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