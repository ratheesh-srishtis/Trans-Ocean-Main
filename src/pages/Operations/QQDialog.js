// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/qqdialog.css";
import { getPdaDetails, getQuestionnaireForm } from "../../services/apiService";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import { useMedia } from "../../context/MediaContext";
const QQDialog = ({ open, onClose, pdaId, ports, vessels }) => {
  const [pdaResponse, setPdaResponse] = useState(null);
  const [questionsList, setQuestionsList] = useState([]);
  const { logoPreview, headerPreview, footerPreview } = useMedia() || {};

  const fetchPdaDetails = async (id) => {
    let data = {
      pdaId: id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      console.log("PDADETAILS", pdaDetails);
      setPdaResponse(pdaDetails?.pda);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };
  const getQuestions = async (id) => {
    try {
      const response = await getQuestionnaireForm();
      console.log("getQuestionnaireForm-response", response);
      setQuestionsList(response?.form);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(pdaId, "pdaId");
    if (pdaId) {
      fetchPdaDetails(pdaId);
    }
  }, [pdaId]);

  useEffect(() => {
    getQuestions();
  }, []);

  const getItemName = (id, name) => {
    console.log(id, "getItemName");
    if (name == "port" && id) {
      const port = ports?.find((s) => s._id === id);
      return port ? port.portName : "Unknown port";
    } else if (name == "vessel" && id) {
      const vessel = vessels.find((s) => s._id === id);
      return vessel ? vessel.vesselName : "Unknown vessel";
    }
  };

  useEffect(() => {
    console.log(pdaResponse, "pdaResponse");
    console.log(ports, "ports");
  }, [pdaResponse, ports]);

  return (
    <>
      <div>
        <Dialog
          sx={{
            width: 1200,
            margin: "auto",
            borderRadius: 2,
          }}
          open={open}
          onClose={(event, reason) => {
            if (reason === "backdropClick") {
              // Prevent dialog from closing when clicking outside
              return;
            }
            onClose(); // Allow dialog to close for other reasons
          }}
          fullWidth
          maxWidth="lg"
        >
          <div className="d-flex justify-content-between ">
            <DialogTitle></DialogTitle>
            <div className="closeicon">
              <i className="bi bi-x-lg " onClick={onClose}></i>
            </div>
          </div>
          <DialogContent style={{ marginBottom: "40px" }}>
            <div>
              <img className="header-image" src={headerPreview}></img>
            </div>

            <div className=" introstyl mt-4 p-4">
              <div>
                Good day, <br />
                Transocean Maritime Services is committed to continuously
                improving our operation standards to ensure customer
                satisfaction and requirements. Your valuable
                feedback/suggestions are essential to help our company to
                fulfill customer's expectations and requirements. it would be
                greatly appreciated if you would complete this simple
                questionnaire and return it to us during this port call. Many
                Thanks.
              </div>

              <div className="portofcall mt-4">
                <table className="portofcallstyl">
                  <thead>
                    <tr>
                      <td className="PortofCallCountry">Job Ref Number</td>
                      <td className="PortofCallCountry">Vessel Name</td>
                      <td className="PortofCallCountry">Date</td>
                      <td className="jobrefn">Port</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="pocstyl">{pdaResponse?.jobId}</td>
                      <td className="pocstyl">
                        {" "}
                        {getItemName(pdaResponse?.vesselId, "vessel")}{" "}
                      </td>
                      <td className="pocstyl">
                        {" "}
                        {new Date(pdaResponse?.ETA).toLocaleDateString("en-GB")}
                      </td>
                      <td className="pocstyl">
                        {" "}
                        {getItemName(pdaResponse?.portId, "port")}{" "}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                Grades
                <span>
                  ( <i className="bi bi-check-lg"></i>)
                </span>
              </div>

              <div className="grstyl">
                <table className="grtabstyl">
                  <thead>
                    <tr>
                      <td className="Excellent">01.</td>
                      <td className=" satisfactory">Excellent Service </td>
                    </tr>
                    <tr>
                      <td className="grtwostyl">02.</td>
                      <td className="good">Good </td>
                    </tr>
                    <tr>
                      <td className="grthreestyl">03.</td>
                      <td className=" satisfactory">Satisfactory </td>
                    </tr>
                    <tr>
                      <td className="grthreestyl">04.</td>
                      <td className=" satisfactory">Average </td>
                    </tr>
                    <tr>
                      <td className="grthreestyl">05.</td>
                      <td className=" satisfactory">Need Improvements </td>
                    </tr>
                    <tr>
                      <td className="grthreestyl">N/A</td>
                      <td className=" satisfactory">Not Applicable </td>
                    </tr>
                  </thead>
                </table>
              </div>

              {questionsList && questionsList?.length > 0 && (
                <>
                  {questionsList?.length > 0 &&
                    questionsList?.map((question, index) => {
                      return (
                        <>
                          <div className="que">
                            <span className="queclr">
                              <i className="bi bi-caret-right-fill"></i>
                            </span>
                            <span className="queclr">{question?.question}</span>
                          </div>
                          <div className="margineight">
                            <table className="portofcallstyl">
                              <thead>
                                <tr>
                                  <td className="quesones">01.</td>
                                  <td className="quesonestyl"></td>
                                  <td className="quesones">02.</td>
                                  <td className="questhree"></td>
                                  <td className="quesones">03.</td>
                                  <td className="questhree"></td>
                                  <td className="quesones">04.</td>
                                  <td className="questhree"></td>
                                  <td className="quesones">05.</td>
                                  <td className="questhree"></td>
                                </tr>
                              </thead>
                            </table>
                          </div>
                        </>
                      );
                    })}
                </>
              )}

              <div className="conclusion">
                Thank you for taking the time to complete this questionnaire.
                Your valuable feedback is essential to help our company to
                fulfill your requirements for smooth arrangements.
              </div>
            </div>

            <table className="tabstyle">
              <thead>
                <tr>
                  <th colspan="12" className=" tableimage ">
                    <img className="footimgqqform" src={footerPreview}></img>
                  </th>
                </tr>
              </thead>
            </table>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default QQDialog;
