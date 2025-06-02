
// import React from 'react';
// import { Element } from 'react-scroll';
// import { FaFacebook, FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";

// const Footerpage = () => (
//   <Element name="footer" className="bg-dark text-white text-center py-4">
    
//     <div className="container flex flex-col items-center"> 
      
//       {/* Social Media Icons - Now ABOVE the copyright */}
//       <div className="social_media_icons flex justify-center gap-4 ">
//         <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
//           <FaFacebook className="text-white hover:text-blue-500" size={32} />
//         </a>
//         <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
//           <FaInstagram className="text-white hover:text-pink-500" size={32} />
//         </a>
//         <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
//           <FaTwitter className="text-white hover:text-blue-400" size={32} />
//         </a>
//         <a href="https://github.com" target="_blank" rel="noopener noreferrer">
//           <FaGithub className="text-white hover:text-gray-400" size={32} />
//         </a>
//       </div>

//       {/* Centered Copyright Text */}
//       <div className="text-center">
//         <p className="text-white text-sm">© 2025 MyCompany. All rights reserved.</p>
//       </div>
      
//     </div>
   
//   </Element>
// );

// export default Footerpage;
import React from 'react';
import { Element } from 'react-scroll';
import { FaFacebook, FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";

const Footerpage = () => (
  <Element name="footer" className="bg-dark text-white text-center py-4">
    <div className="container flex justify-between items-center mx-auto max-w-5xl px-4">
      
      {/* Copyright Text on the Left */}
      <p className="text-white text-sm">© 2025 Wellbee. All rights reserved.</p>

      {/* Social Media Icons on the Right */}
      <div className="flex gap-10">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebook className="text-white hover:text-blue-500 mx-4" size={32} />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="text-white hover:text-pink-500 mx-4" size={32} />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaTwitter className="text-white hover:text-blue-400 mx-4" size={32} />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <FaGithub className="text-white hover:text-gray-400 mx-4" size={32} />
        </a>
      </div>
      
    </div>
  </Element>
);

export default Footerpage;
