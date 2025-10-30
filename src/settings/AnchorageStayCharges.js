import React, { useState, useEffect } from "react";
import "../css/reports.css";
import { useNavigate } from "react-router-dom";
import {
  getAnchorageStayChargePorts,
  getAnchorageStayCharge,
  updateAnchorageStayRemark
} from "../services/apiSettings";
import Loader from "../pages/Loader";
import PopUp from "../pages/PopUp";
import StayCharge from "./StayCharge";
const AnchorageStayCharges = () => {
  const navigate = useNavigate();
  const Group = require("../assets/images/Reports.png");

  const [anchorageStayCharges, setAnchorageStayCharges] = useState([]);
  const [anchorageRemarks, setAnchorageRemarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
 const [message, setMessage] = useState("");
   const [openPopUp, setOpenPopUp] = useState(false);

  // Local state for textareas
  const [stayRemark, setStayRemark] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [quotationNotes, setQuotationNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);


  const fetchAnchorageStayChargePorts = async () => {
    try {
      setIsLoading(true);
      const response = await getAnchorageStayChargePorts();
      setAnchorageStayCharges(response?.ports);
      setAnchorageRemarks(response?.anchorageChargeRemark);
      console.log(response, "response_fetchAnchorageStayChargePorts");
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
      setIsLoading(false);
    }
  };

  // Sync local state with API data
  useEffect(() => {
    setStayRemark(anchorageRemarks.anchorageStayRemark || "");
    setInvoiceNotes(anchorageRemarks.invoicePDFNotes || "");
    setQuotationNotes(anchorageRemarks.quotationPDFNotes || "");
  }, [anchorageRemarks]);

  useEffect(() => {
    fetchAnchorageStayChargePorts();
  }, []);



  useEffect(() => {
    console.log(anchorageStayCharges, "anchorageStayCharges");
  }, [anchorageStayCharges]);

    // Update remarks handler
  const handleUpdateRemarks = async () => {
    setIsLoading(true);
    try {
      await updateAnchorageStayRemark({
        detailsId: anchorageRemarks._id,
        anchorageStayRemark: stayRemark,
        quotationPDFNotes: quotationNotes,
        invoicePDFNotes: invoiceNotes
      });
      setIsLoading(false);
      setMessage("Remarks updated successfully.");
                  setOpenPopUp(true);

      fetchAnchorageStayChargePorts(); // Refresh data
    } catch (err) {
      setMessage("Failed to update remarks.");
                  setOpenPopUp(true);

    }
    setIsLoading(false);
  };

//   {
//     "anchorageStayRemark": "Vessels waiting at anchorage due non-availability of berth shall not be charged anchorage fees.",
//     "quotationPDFNotes": "**Effective from 16th April 2021, 5% of VAT will applicable as per new Government regulation in the Sultanate of Oman.\n ***Denotes estimated charges and actual as per port bills \n ****Agency fess does not include Immarsat calls or telexes. If necessary will be charged out of costs",
//     "invoicePDFNotes": "-Payment due within 3days of invoicing\n -2% interest / month shall be charged if the payment is not made with in the due date\n-our standared terms and conditons apply ,copy avaliable up on request",
//     "_id": "68cb88212e901e4d31768900"
// }

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

         {/* Remarks Section */}
        <div className="remarks-section">
          <h2>Update Anchorage Stay Remarks</h2>
          <div className="remark-field">
            <label htmlFor="stayRemark">Anchorage Stay Remark</label>
            <textarea
              id="stayRemark"
              value={stayRemark}
              onChange={e => setStayRemark(e.target.value)}
              rows={3}
              className="remark-textarea"
              disabled={isUpdating}
            />
          </div>
          <div className="remark-field">
            <label htmlFor="invoiceNotes">Invoice PDF Notes</label>
            <textarea
              id="invoiceNotes"
              value={invoiceNotes}
              onChange={e => setInvoiceNotes(e.target.value)}
              rows={3}
              className="remark-textarea"
              disabled={isUpdating}
            />
          </div>
          <div className="remark-field">
            <label htmlFor="quotationNotes">Quotation PDF Notes</label>
            <textarea
              id="quotationNotes"
              value={quotationNotes}
              onChange={e => setQuotationNotes(e.target.value)}
              rows={3}
              className="remark-textarea"
              disabled={isUpdating}
            />
          </div>
           <button
            className="update-remarks-btn"
            onClick={handleUpdateRemarks}
            disabled={isUpdating || isLoading}
          >
            {isUpdating ? "Updating..." : "Update Remarks"}
          </button>
        </div>
      </div>
       <Loader isLoading={isLoading} />

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default AnchorageStayCharges;
