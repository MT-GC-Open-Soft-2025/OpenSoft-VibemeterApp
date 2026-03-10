

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from "@emailjs/browser";
import "./ContactForm.css"; // Import the CSS file
import Feedbacknavbar from '../../components/Feedback_navbar/Feedbacknavbar';
import axios from "axios";
import { Element, Link } from "react-scroll";
import "bootstrap/dist/css/bootstrap.min.css";

import { FaUser, FaUserShield } from "react-icons/fa";
import Swal from "sweetalert2";
const ContactForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleGoBack = () => {

    navigate(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .send(
        "service_a4qj7tr",
        "template_dmmicgj",
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        },
        "HdJeyKeeZ-eU_AELB"
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          // setStatus("Message sent successfully!");
          Swal.fire({
            icon: 'success',
            title: 'Message sent successfully!',
            confirmButtonColor: '#36ABAA'
          });
          setFormData({ name: "", email: "", message: "" });
        },
        (error) => {
          console.log("FAILED...", error);
          //setStatus("Failed to send message.");
          Swal.fire({
            icon: 'error',
            title: 'Failed to send message.',
            confirmButtonColor : '#d33'
          });
        }
      );
  };

  return (
    <div className='feedback-wrapper'>
      <Feedbacknavbar title="Contact Us" />

      <div className="contact-split-card">
        {/* Left Side: Contact Info */}
        <div className="contact-info-side">
          <h2 className="contact-info-title">Let's Talk</h2>
          <p className="contact-info-desc">
            Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
          </p>
          
          <div className="contact-meta">
            <div className="contact-meta-icon">📍</div>
            <span>123 WellBee Street, Tech City, NY</span>
          </div>
          <div className="contact-meta">
            <div className="contact-meta-icon">✉️</div>
            <span>support@wellbee.com</span>
          </div>
          <div className="contact-meta">
            <div className="contact-meta-icon">📞</div>
            <span>+1 (555) 123-4567</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="contact-form-side">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-floating mb-4">
              <input
                type="text"
                className="form-control"
                id="floatingName"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <label htmlFor="floatingName">Your Name</label>
            </div>
            
            <div className="form-floating mb-4">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label htmlFor="floatingEmail">Your Email</label>
            </div>

            <div className="form-floating mb-4">
              <textarea
                className="form-control"
                id="floatingMessage"
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <label htmlFor="floatingMessage">How can we help?</label>
            </div>

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
          {status && <p className="success-message">{status}</p>}
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
