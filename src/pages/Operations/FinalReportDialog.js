// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import "../../css/finalreportdialog.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import {
  getServiceReport,
  getPdaDetails,
  getAnchorageLocations,
} from "../../services/apiService";
import { useRef } from "react";
import moment from "moment";
import { useMedia } from "../../context/MediaContext";
const FinalReportDialog = ({ open, onClose, pdaId, ports }) => {
  const [serviceReports, setServiceReports] = useState([]);
  const [pdaResponse, setPdaResponse] = useState(null);
  const [anchorageLocations, setAnchorageLocations] = useState([]);
  const { logoPreview, headerPreview, footerPreview } = useMedia() || {};

  const serviceReportGet = async (id) => {
    let data = {
      pdaId: id,
    };
    try {
      const serviceReportResponse = await getServiceReport(data);
      console.log("serviceReportGet", serviceReportResponse);
      setServiceReports(serviceReportResponse?.report);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

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

  useEffect(() => {
    console.log(pdaId, "pdaId");
    if (pdaId) {
      fetchPdaDetails(pdaId);
      serviceReportGet(pdaId);
    }
  }, [pdaId]);

  useEffect(() => {
    console.log(open, "open");
    if (open == true) {
      fetchPdaDetails(pdaId);
      serviceReportGet(pdaId);
    }
  }, [open, pdaId]);

  const hasFetchedAnchorage = useRef(false);

  const fetchAnchorageValues = async (data) => {
    console.log(data, "id_fetchAnchorageValues");
    try {
      const formdata = {
        portId: data,
      };
      const response = await getAnchorageLocations(formdata);
      console.log(response, "response_fetchAnchorageValues");
      if (response.status) {
        setAnchorageLocations(response?.area);
        localStorage.setItem(
          "anchorage_locations_list",
          JSON.stringify(response.area)
        );
      }
    } catch (error) {
      console.error("Error fetching anchorage values:", error);
    }
  };

  useEffect(() => {
    console.log(pdaResponse, "pdaResponse");
    console.log(anchorageLocations, "anchorageLocations");
    console.log(ports, "ports");
    if (pdaResponse?.portId && !hasFetchedAnchorage.current) {
      fetchAnchorageValues(pdaResponse?.portId);
      hasFetchedAnchorage.current = true; // Mark as fetched
    }
  }, [pdaResponse, ports, anchorageLocations]);

  const getItemName = (id, name) => {
    console.log(id, "getItemName");
    if (name == "port" && id) {
      const port = ports?.find((s) => s._id === id);
      return port ? port.portName : "Unknown port";
    } else if (name == "anchorage" && id) {
      const anchorage = anchorageLocations.find((s) => s._id === id);
      return anchorage ? anchorage.area : "Unknown anchorage";
    }
  };

  return (
    <>
      <div>
        <Dialog
          sx={{
            width: 1000,
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
          <div className="d-flex justify-content-between " onClick={onClose}>
            <DialogTitle> </DialogTitle>
            <div className="closeicon">
              <i className="bi bi-x-lg "></i>
            </div>
          </div>
          <DialogContent style={{ marginBottom: "40px" }}>
            <div>
              <img className="header-image" src={headerPreview}></img>
            </div>

            <div className="portofcall mt-4">
              <table className="portofcallstyl">
                <thead>
                  <tr>
                    <th className="PortofCallCountry">PORT</th>
                    <th className="PortofCallCountry">ANCHORAGE LOCATION</th>
                    <th className="PortofCallCountry">ARRIVAL DATE</th>
                    <th className="jobrefn">DEPARTURE DATE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pocstyl">
                      {getItemName(pdaResponse?.portId, "port")}
                    </td>
                    <td className="pocstyl">
                      {" "}
                      {getItemName(
                        pdaResponse?.anchorageLocation,
                        "anchorage"
                      )}{" "}
                    </td>
                    <td className="pocstyl">
                      {" "}
                      {new Date(pdaResponse?.ETA).toLocaleDateString("en-GB", {
                        timeZone: "UTC",
                      })}{" "}
                    </td>
                    <td className="pocstyl">
                      {new Date(pdaResponse?.ETD).toLocaleDateString("en-GB", {
                        timeZone: "UTC",
                      })}{" "}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="soaf" style={{ textTransform: "uppercase" }}>
                FINAL REPORT
                {/* {getItemName(pdaResponse?.portId, "port")?.toUpperCase()} */}
              </div>
              <table className="portofcallstyl mt-3">
                <thead>
                  <tr>
                    <th className="PortofCallCountry">SL NO.</th>
                    <th className="PortofCallCountry">DESCRIPTION</th>
                    <th className="PortofCallCountry">DATE & TIME </th>
                    <th className="PortofCallCountry">SERVICE ACTIVITIES</th>
                    <th className="jobrefn">QUANTITY</th>
                    <th className="PortofCallCountry">REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceReports?.length > 0 &&
                    serviceReports.map((report, index) => (
                      <tr key={index}>
                        <td className="pocstyl">{index + 1}</td>
                        <td className="pocstyl">{report?.description}</td>
                        <td className="pocstyl">
                          {moment
                            .utc(report?.serviceDate, "DD-MM-YYYY HH:mm")
                            .format("DD-MM-YYYY HH:mm A")}
                        </td>
                        <td className="pocstyl">{report?.serviceActivity}</td>
                        <td className="pocstyl">{report?.quantity}</td>
                        <td className="pocstyl">{report?.remark}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <table className="tabstyle mt-2">
              <thead>
                <tr>
                  <th colspan="12" className=" tableimage ">
                    <img className="footimgfinal" src={footerPreview}></img>
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

export default FinalReportDialog;
