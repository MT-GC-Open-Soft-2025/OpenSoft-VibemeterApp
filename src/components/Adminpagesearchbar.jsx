import React from "react";
import "./Adminpagesearchbar.css";
import searchIcon from './Adminpagesearchicon.png';  

const Searchbar = () => {
    return(
        <div className="search-container">
            <div className="search-input-wrapper">
                <input 
                    type="text" 
                    className="search-bar" 
                    placeholder="Search..."
                    style={{ 
                        backgroundImage: `url(${searchIcon})`,
                        backgroundPosition: 'right 12px center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '18px',
                        filter: 'opacity(0.4) grayscale(100%)'
                    }}
                />
            </div>
        </div>
    );
};

export default Searchbar;