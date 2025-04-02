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
          <div className="container">
          <div className="logo-container">
              <img src={logo} alt="WellBee Logo" className="logo-img" />
            </div>
          
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="landing" smooth duration={500}>Home</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="login" smooth duration={500}>Sign In</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="faq" smooth duration={500}>FAQ</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="book-demo" smooth duration={500}>Book a Demo</Link>
              </li>

                <li className="nav-item">
                  <Link className="nav-link" to="footer" smooth duration={500}>Footer</Link>
                </li>
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