import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import "./SearchBar.css";

const Navbar = ({ setSelectedEmployee }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/admin/get_details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("API Response:", response.data);
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  const validateInput = (value) => /^EMP\d{4}$/.test(value);

  const handleSearchChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchTerm(value);
    setErrorMessage("");

    if (value === "") {
      setShowDropdown(false);
      return;
    }

    if (!validateInput(value) && value.length >= 7) {
      setErrorMessage("Invalid Employee ID. Use EMPXXXX.");
      setShowDropdown(false);
      return;
    }

    const filtered = Array.isArray(employees) ? employees.filter((emp) => emp.startsWith(value)) : [];
    setShowDropdown(filtered.length > 0);
  };

  const handleSearchClick = async () => {
    if (!validateInput(searchTerm)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Format",
        text: "Please enter an Employee ID in the format EMPXXXX.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://127.0.0.1:8000/admin/get_detail/${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Object.keys(response.data).length > 0) {
        Swal.fire({
          icon: "success",
          title: "Employee Found!",
          text: `Redirecting to Employee ID: ${searchTerm}`,
          confirmButtonColor: "#36ABAA",
        }).then(() => {
          setSelectedEmployee(searchTerm);
          setSearchTerm("");
          setShowDropdown(false);
        });
      } else {
        throw new Error("Employee not found.");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Employee Not Found!",
        text: "The entered Employee ID does not exist or you don't have permission.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <>
      <div className="search-container">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="search-icon feather feather-search">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
        <input
          type="text"
          className="form-control search-input ps-5"
          placeholder="Search Employee ID"
          aria-label="Search"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button className="btn btn-search ms-2" onClick={handleSearchClick}>
          Search
        </button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {showDropdown && (
          <ul className="dropdown">
            {employees.filter((emp) => emp.startsWith(searchTerm)).map((emp) => (
              <li key={emp} onClick={() => setSearchTerm(emp)}>
                {emp}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Navbar;
{/* <div class="container">
        <div class="row justify-content-center">
            <div class="col-12 col-md-8 col-lg-6">
                <div class="search-container position-relative">
                    <form class="d-flex align-items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="search-icon feather feather-search">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input class="form-control search-input ps-5" type="search"
                               placeholder="Search anything..." aria-label="Search">
                        <button class="btn btn-search ms-2" type="submit">Search</button>
                    </form>
                </div>
            </div>
        </div>
    </div> */}