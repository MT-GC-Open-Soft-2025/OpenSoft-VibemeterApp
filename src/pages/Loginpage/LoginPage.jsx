import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; 
import "./LoginPage.css";
import bot from "../../Assets/bot.png";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/admin"); // Navigate to AdminPage
  };

  const userLogin = (e) => {
    e.preventDefault();
    navigate("/user"); 
  };

  return (
   
    <div className="wrapper fadeInDown">
      
      <div id="formContent">
        <div className="fadeIn first">
          <img src={bot} id="icon" alt="User Icon" />
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            id="login"
            className="fadeIn second"
            name="username"
            placeholder="employeeId"
          />
          <input
            type="text"
            id="login"
            className="fadeIn second"
            name="username"
            placeholder="password"
          />
          <input type="submit" className="fadeIn fourth btn btn-primary" value="Log In" />
        </form>

        <form onSubmit={userLogin}>
          
          <input type="submit" className="fadeIn fourth btn btn-primary" value="Log In User" />
        </form>

        <div id="formFooter">
          <a className="underlineHover" href="#">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


