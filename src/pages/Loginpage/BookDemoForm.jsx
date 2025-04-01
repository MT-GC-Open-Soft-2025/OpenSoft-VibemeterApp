
import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';
import './BookDemoForm.css';

const BookDemoForm = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_p0ltpvl', 'template_qajfj5u', form.current, 'Yb0RZ4BXYc6v5u_hc').then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Demo Booked!',
        text: 'We’ll be in touch with you shortly via email.',
      });
      form.current.reset();
    }).catch(() => {
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Something went wrong. Try again later.',
      });
    });
  };

  return (
    <section className="section bg-white" id="book-demo">
      <div className="container py-5" data-aos="fade-up">
        <div className="row align-items-center">
          <div className="col-md-6">
            <img
              src="https://img.freepik.com/free-vector/schedule-appointment-concept-illustration_114360-4844.jpg"
              alt="Book Demo Illustration"
              className="img-fluid"
            />
          </div>
          <div className="col-md-6">
            <h2 className="text-primary mb-4">Book a Free Demo 💬</h2>
            <form ref={form} onSubmit={sendEmail}>
              <div className="mb-3">
                <input className="form-control" name="user_name" placeholder="Your Company Name" required />
              </div>
              <div className="mb-3">
                <input className="form-control" type="email" name="user_email" placeholder="Your Company Email" required />
              </div>
              <div className="mb-3">
                <textarea className="form-control" name="message" placeholder="Tell us more about your comapny" rows="4" />
              </div>
              <button type="submit" className="btn btn-primary w-100">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookDemoForm;
