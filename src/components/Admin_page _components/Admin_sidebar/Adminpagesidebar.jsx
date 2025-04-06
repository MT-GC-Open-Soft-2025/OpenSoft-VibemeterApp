import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Adminpagesidebar.css";
import Profilepic from "./Adminprofile.png";
import logoutIcon from "./Adminlogout.png";
import Swal from "sweetalert2";

const Sidebar = () => {
    const [activeItem, setActiveItem] = useState('Overview');
    const navigate = useNavigate();

    const handleItemClick = () => {
        Swal.fire({
          title: "Are you sure?",
          text: "You will be logged out.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, log out",
          cancelButtonText: "No, stay",
          confirmButtonColor: '#36ABAA'
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem("token");
            navigate('/');
          }
        });
      };

    return (
        <div className="sidebar">
            <div className="sidebar-content">
                <div className="profile-container">
                    <img src={Profilepic} alt="profile" className="profile-icon" />
                </div>
                <ul className="sidebar-menu">
                    <li 
                        className={`sidebar-item ${activeItem === 'Overview' ? 'active' : ''}`}
                        onClick={() => handleItemClick('Overview')}
                    >
                        Overview
                    </li>
                    {/* <li 
                        className={`sidebar-item ${activeItem === 'Contact Us' ? 'active' : ''}`}
                        onClick={() => handleItemClick('Contact Us')}
                    >
                        Contact Us       
                    </li> */}
                     <li className="sidebar-item" onClick={() =>navigate("/contact")}>
          Contact Us
        </li>
                    <li 
                        className="sidebar-item logout-item"
                        onClick={() => handleItemClick('Log Out')}
                    >
                        <span className="logout-text">Log Out</span>
                        <img src={logoutIcon} alt="logout" className="logout-icon" />
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;