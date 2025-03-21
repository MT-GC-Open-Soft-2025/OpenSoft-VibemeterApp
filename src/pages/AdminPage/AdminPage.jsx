import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
// import "./AdminnPage.css"
import EmojiMeter from "../../components/EmojiMeter";
import bot from "../../Assets/bot.png";
// import Button from "../../components/samplecomponent";

const AdminPage = () => {
  return (

    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
    <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>
    <div className="w-full max-w-4xl">
      <EmojiMeter />
      
      <div className="mt-8 text-center text-gray-600">
        <p>Welcome to your admin dashboard. The emoji above represents your current happiness level.</p>
      </div>
    </div>
  </div>
    
    // <div className="wrapper fadeInDown">
    //   "This is admin page."
    // </div>
  );
};

export default AdminPage;
