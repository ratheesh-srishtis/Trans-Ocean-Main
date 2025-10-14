import React, { useState, useEffect } from "react";
import "../css/reports.css";
import { useNavigate } from "react-router-dom";
import {
  getAnchorageStayChargePorts,
  getAnchorageStayCharge,
} from "../services/apiSettings";
import StayCharge from "./StayCharge";
const AnchorageStayCharges = () => {
  const navigate = useNavigate();
  const Group = require("../assets/images/Reports.png");

  const [anchorageStayCharges, setAnchorageStayCharges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const fetchAnchorageStayChargePorts = async () => {
    try {
      setIsLoading(true);
      const response = await getAnchorageStayChargePorts();
      setAnchorageStayCharges(response?.ports);
      console.log(response, "response_fetchAnchorageStayChargePorts");
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnchorageStayChargePorts();
  }, []);



  useEffect(() => {
    console.log(anchorageStayCharges, "anchorageStayCharges");
  }, [anchorageStayCharges]);

  return (
    <>
      <div>
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        <div>
          {anchorageStayCharges.map((port, index) => (
            <>
              <div
                onClick={() =>
                  navigate("/stay-charge", { state: { port: port } })
                }
              >
                <div key={port._id} className="jobreporrt mb-3">
                  {`${index + 1}. ${port.portName.toUpperCase()}`}
                </div>
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
};

export default AnchorageStayCharges;
