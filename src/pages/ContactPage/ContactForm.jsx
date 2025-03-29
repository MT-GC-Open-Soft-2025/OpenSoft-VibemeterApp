
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from "@emailjs/browser";
import "./ContactForm.css"; // Import the CSS file
import Feedbacknavbar from '../../components/Feedbacknavbar';

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
          setStatus("Message sent successfully!");
          setFormData({ name: "", email: "", message: "" });
        },
        (error) => {
          console.log("FAILED...", error);
          setStatus("Failed to send message.");
        }
      );
  };

  return (
     <div className='feedback-wrapper'>
    {/* //   <nav className='navbar'>
    //     <div className='nav-content'>Contact Us</div>
    //     <button className='go-back-btn' onClick={handleGoBack}>Go Back</button>
    //   </nav>
     */}
    <Feedbacknavbar title="Contact Us" />

      
    <div className="contact-form-container">
      <h2>Contact Us</h2>
      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
        <button type="submit">Send Message</button>
      </form>
      {status && <p className="success-message">{status}</p>}
    </div>
    </div>
    
  );
};

export default ContactForm;
