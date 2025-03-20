import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";
import bot from "../../Assets/bot.png";
import ButtonComponent from "../../components/ButtonComponent"; // Adjust path if needed

const LoginPage = () => {
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

        {/* Link to Feedback Page */}
        <ButtonComponent label="Give Feedback" />


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

