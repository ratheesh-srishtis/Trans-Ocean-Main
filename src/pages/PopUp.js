import React from "react";
import "../css/popup.css";

const PopUp = ({ message, closePopup }) => {
  const btLogo = require("../assets/images/check.png");

  return (
    <div className="popupbackground">
      <div className="popupcontainermain">
        <div className="logo-header">
          <img src={btLogo} alt="logo" />
        </div>
        <div className="message">
          <p>{message}</p>
        </div>
        <div className="firstfooter d-flex justify-content-Center">
          <button type="button" className="btn add-button" onClick={closePopup}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUp;
