import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../../css/payment.css";
const Settings = () => {
const Group = require("../../assets/images/hrsettings.png");
const navigate = useNavigate();
const redirectToWorkDays=()=>{
  navigate('/workcalendar');
}
const redirectToDesigination=()=>{
  navigate('/desiginations');
}
 return (
    <div >
 <div className="charge mt-3">
        <div className="rectangle"></div>
        <div>
          <img src={Group}></img>
        </div>
      
      </div>

      <div className="hrsetting">
        <button onClick={redirectToWorkDays} className="Workingdays">Working Days</button>
        <button onClick={redirectToDesigination}  className="designationadd">Designation</button>
    </div>
    </div>
   
  );
};

export default Settings;
