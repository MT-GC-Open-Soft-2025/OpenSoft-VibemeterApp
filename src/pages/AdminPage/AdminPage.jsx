import React from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./AdminPage.css"
import bot from "../../Assets/bot.png";
// import Button from "../../components/samplecomponent";

const AdminPage = () => {
  return (
    <div className="wrapper fadeInDown">
      
      <div id="formContent">
        <div className="fadeIn first">
          <img
            src={bot}
            id="icon"
            alt="User Icon"
          />
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
          
          {/* <input
            type="password"
            id="password"
            className="fadeIn second"
            name="password"
            placeholder="Password"
          /> */}
          <input type="submit" className="fadeIn fourth btn btn-primary" value="Log In" />
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

export default AdminPage;
