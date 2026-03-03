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
          title: "Ready to leave?",
          text: "You will be logged out of your session.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes, log out",
          cancelButtonText: "Cancel",
          customClass: {
            popup: "rounded-4 shadow-sm border-0",
            confirmButton: "btn btn-danger rounded-pill px-4 mx-2 fw-bold",
            cancelButton: "btn btn-light rounded-pill px-4 mx-2 fw-bold border"
          },
          buttonsStyling: false
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
                        className={`sidebar-item d-flex align-items-center ${activeItem === 'Overview' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveItem('Overview');

                        }}
                    >
                        Overview
                    </li>
                    {/* <li
                        className={`sidebar-item ${activeItem === 'Contact Us' ? 'active' : ''}`}
                        onClick={() => handleItemClick('Contact Us')}
                    >
                        Contact Us
                    </li> */}
                     <li className="sidebar-item d-flex align-items-center" onClick={() =>navigate("/contact")}>
          Contact Us
        </li>
                    <li
                        className="sidebar-item logout-item d-flex align-items-center"
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
