import React from "react";
import "./Transwave-Templates-css/QQ_Form.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

const QQForm = ({
  open,
  onClose,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
}) => {
  const Group = require("../assets/images/qq.png");

  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return; // Prevent closing on backdrop click
    }
    onClose(event, reason);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>QQ Form</DialogTitle>
      <DialogContent>
        <div className="qq-form">
          <div className="">
            <div className="charge mt-4">
              <div className="rectangle"></div>
              <div>
                <img src={Group}></img>
              </div>
            </div>
            <div className="p-4">
              {/* first question */}
              <div className="que">
                <span className="spacolo">
                  <i className="bi bi-caret-right-fill"></i>
                </span>
                <span className="spacolo">
                  How would you rate the port instructions / pre arrival and
                  husbandry informations provided by our team ?
                </span>
              </div>
              <div className="mt-4">
                <table className="tab">
                  <thead>
                    <tr>
                      <td className="styltabl">01.</td>
                      <td className="tabsplstyl">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="flexCheckDefault"
                        ></input>
                      </td>
                      <td className="styltabl">02.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">03.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">04.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">05.</td>
                      <td className="tabstl"></td>
                    </tr>
                  </thead>
                </table>
              </div>
              {/* Second question */}
              <div className="que">
                <span className="spacolo">
                  <i className="bi bi-caret-right-fill"></i>
                </span>
                <span className="spacolo">
                  Was communication and information expected progress timely and
                  accurately provided for ?
                </span>
              </div>
              <div className="mt-4">
                <table className="tab">
                  <thead>
                    <tr>
                      <td className="styltabl">01.</td>
                      <td className="tabsplstyl">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="flexCheckDefault"
                        ></input>
                      </td>
                      <td className="styltabl">02.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">03.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">04.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">05.</td>
                      <td className="tabstl"></td>
                    </tr>
                  </thead>
                </table>
              </div>
              {/* third question */}
              <div className="que">
                <span className="spacolo">
                  <i className="bi bi-caret-right-fill"></i>
                </span>
                <span className="spacolo">
                  How would you rate the Transportation / Hotel / crew change
                  arrangements ?
                </span>
              </div>
              <div className="mt-4">
                <table className="tab">
                  <thead>
                    <tr>
                      <td className="styltabl">01.</td>
                      <td className="tabsplstyl">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="flexCheckDefault"
                        ></input>
                      </td>
                      <td className="styltabl">02.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">03.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">04.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">05.</td>
                      <td className="tabstl"></td>
                    </tr>
                  </thead>
                </table>
              </div>
              {/* fourth question */}
              <div className="que">
                <span className="spacolo">
                  <i className="bi bi-caret-right-fill"></i>
                </span>
                <span className="spacolo">
                  How would you rate the arrangements for technical attendance /
                  supplies ?
                </span>
              </div>
              <div className="mt-4">
                <table className="tab">
                  <thead>
                    <tr>
                      <td className="styltabl">01.</td>
                      <td className="tabsplstyl">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="flexCheckDefault"
                        ></input>
                      </td>
                      <td className="styltabl">02.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">03.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">04.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">05.</td>
                      <td className="tabstl"></td>
                    </tr>
                  </thead>
                </table>
              </div>
              {/* fifth question */}
              <div className="que">
                <span className="spacolo">
                  <i className="bi bi-caret-right-fill"></i>
                </span>
                <span className="spacolo">
                  Please rate the availability of our TOMS staff as per your
                  service requirements ?
                </span>
              </div>
              <div className="mt-4">
                <table className="tab">
                  <thead>
                    <tr>
                      <td className="styltabl">01.</td>
                      <td className="tabsplstyl">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="flexCheckDefault"
                        ></input>
                      </td>
                      <td className="styltabl">02.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">03.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">04.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">05.</td>
                      <td className="tabstl"></td>
                    </tr>
                  </thead>
                </table>
              </div>
              {/* sixth question */}
              <div className="que">
                <span className="spacolo">
                  <i className="bi bi-caret-right-fill"></i>
                </span>
                <span className="spacolo">
                  Overall. How would you rate the services provided by our team
                  for your good vessel?
                </span>
              </div>
              <div className="mt-4">
                <table className="tab">
                  <thead>
                    <tr>
                      <td className="styltabl">01.</td>
                      <td className="tabsplstyl">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="flexCheckDefault"
                        ></input>
                      </td>
                      <td className="styltabl">02.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">03.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">04.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">05.</td>
                      <td className="tabstl"></td>
                    </tr>
                  </thead>
                </table>
              </div>
              {/* seventh question */}
              <div className="que">
                <span className="spacolo">
                  <i className="bi bi-caret-right-fill"></i>
                </span>
                <span className="spacolo">
                  Would you recommend Transocean Maritime Service to others?
                </span>
              </div>
              <div className="mt-4">
                <table className="tab">
                  <thead>
                    <tr>
                      <td className="styltabl">01.</td>
                      <td className="tabsplstyl">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          value=""
                          id="flexCheckDefault"
                        ></input>
                      </td>
                      <td className="styltabl">02.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">03.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">04.</td>
                      <td className="tabstl"></td>
                      <td className="styltabl">05.</td>
                      <td className="tabstl"></td>
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
            <div className="grade">
              * Grades 01 Excellent Service 02 Good 03 Satisfactory 04 Average
              05 Need Improvements N/A Not Applicable
            </div>

            <div className="greport">
              <button className="btn btna submit-button btnfsize mb-4">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QQForm;
