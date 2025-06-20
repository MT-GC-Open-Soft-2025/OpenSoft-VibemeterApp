import React, { useEffect } from 'react';
import { Link } from 'react-scroll';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import FAQPage from './FAQsection';
import Footer from './Footer';
import ChatInterface from './ChatInterface';
import { Element } from 'react-scroll';
import BookDemoForm from './BookDemoForm';
import logo from './company_logo.png';

import 'bootstrap/dist/css/bootstrap.min.css';
import './Start.css';

import 'animate.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Start = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
      offset: 100,
    });
  }, []);

  return (
      <div>
        {/* Navigation Bar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm">
          <div className="container-fluid">
          <div className="logo-container" style={{ marginLeft: "20px"}}>
              <img src={logo} alt="WellBee Logo" className="logo-img" />
            </div>
          
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto" style={{ marginRight: "30px"}}>
                <li className="nav-item ">
                <Link to="landing" smooth duration={500} className="lead1 nav-link hover:text-gray-300" style={{ cursor: 'pointer' }}>Home</Link>
                </li>
                <li className="nav-item">
                <Link to="signin" smooth duration={500} className="lead1 nav-link hover:text-gray-300" style={{ cursor: 'pointer' }}>Sign In</Link>

                </li>
                
                <li className="nav-item">
                <Link to="faq" smooth duration={500} className="lead1 nav-link hover:text-gray-300" style={{ cursor: 'pointer' }}>FAQ</Link>
                </li>
                <li className="nav-item">
                <Link to="book-demo" smooth duration={500} className="lead1 nav-link hover:text-gray-300" style={{ cursor: 'pointer' }}>Book a Demo</Link>
              </li>

                {/* <li className="nav-item">
                  <Link className="nav-link" to="footer" smooth duration={500}>Footer</Link>
                </li> */}
              </ul>
            </div>
          </div>
        </nav>

        {/* Page Sections */}
        
        <LandingPage />
        <LoginPage />
        <FAQPage />
        <Element name="bookdemo">
          <BookDemoForm />
        </Element>
        <Footer />
      
      </div>
  );
};


export default Start;