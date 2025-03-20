import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";
import bot from "../../Assets/bot.png";
import ButtonComponent from "../../components/ButtonComponent"; 

const LoginPage = () => {
  const handleButtonClick = () => {
    alert("Button clicked!");
  };

  return (
    <div className="wrapper fadeInDown">
      <div id="formContent">
        <div className="fadeIn first">
          <img src={bot} id="icon" alt="User Icon" />
        </div>

        <form>
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
          <input
            type="submit"
            className="fadeIn fourth btn btn-primary"
            value="Log In"
          />
        </form>

        {/* Adding the button component */}
        <ButtonComponent label="Click Me" onClick={handleButtonClick} />

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

