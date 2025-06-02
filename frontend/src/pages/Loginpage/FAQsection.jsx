import React from 'react';
import { Element } from 'react-scroll';
import { Accordion } from 'react-bootstrap';
import './FAQsection.css';

const FAQPage = () => (
  <Element name="faq" className="faq-section bg-white text-center">
    <div className="container py-5">

      <div className="row align-items-center">
        {/* Left Side: Illustration */}
        <div className="col-md-6 mb-4 mb-md-0" data-aos="fade-right">
          <img
            src="https://img.freepik.com/free-vector/faq-concept-illustration_114360-5185.jpg"
            alt="FAQ Illustration"
            className="img-fluid"
            style={{ maxHeight: '350px' }}
          />
        </div>

        {/* Right Side: FAQ Content */}
        <div className="col-md-6 text-start" data-aos="fade-left">
          <h2 className="text-primary fw-bold mb-4" style={{fontFamily:'Comfortaa'}}>Frequently Asked Questions</h2>
          <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0">
              <Accordion.Header>What is WellBee?</Accordion.Header>
              <Accordion.Body>
                WellBee is your mental health companion. We provide tools to improve mood,
                reduce anxiety, and build emotional resilience through guided sessions and support.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Is it free to use?</Accordion.Header>
              <Accordion.Body>
                Yes! WellBee offers a wide range of free resources. Some premium features may require a subscription.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>How does the chatbot work?</Accordion.Header>
              <Accordion.Body>
                Our AI-powered MindBot offers emotional support, check-ins, and wellness reminders through a chat interface.
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Can I talk to a real therapist?</Accordion.Header>
              <Accordion.Body>
                While WellBee doesn't offer therapy, we connect you with verified resources if you need professional help.
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      </div>

    </div>
  </Element>
);
console.log("FAQPage Loaded!");

export default FAQPage;