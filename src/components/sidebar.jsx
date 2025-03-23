import React from "react";
import "./sidebar.css";
import Profilepic from "./profile.png";

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-content">
                <div className="profile-container">
                    <img src={Profilepic} alt="profile" className="profile-icon" />
                </div>
                <ul className="sidebar-menu">
                    <li className="sidebar-item">Dashboard</li>
                    <li className="sidebar-item">Profile</li>
                    <li className="sidebar-item">Settings</li>
                    <li className="sidebar-item">Reports</li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;