// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import Loader from "./Loader";
import "../css/addcharges.css";
import "../css/editcharges.css";
import "../css/sendquotation.css";
import "../css/generatepda.css";
import "../css/epda.css";
import { getPdaFile, getPdaDetails } from "../services/apiService";
import { useMedia } from "../context/MediaContext";
import {
  getSubcharges,
  getCharges,
  editChargeQuotation,
  addPDACharges,
} from "../services/apiService";
import moment from "moment";
import PopUp from "./PopUp";
const PdaDialog = ({
  open,
  onClose,
  services,
  customers,
  ports,
  pdaResponse,
  vendors,
  vessels,
  cargos,
}) => {
  console.log(services, "services");
  console.log(pdaResponse, "pdaResponse_dialog");
  const { logoPreview, headerPreview, footerPreview } = useMedia() || {};

  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [pdfData, setPdfData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdaDetails, setPdaDetails] = useState(null);
  const [anchorageStayCharges, setAnchorageStayCharges] = useState(null);
  const [companyBankDetails, setCompanyBankDetails] = useState(null);
  const [marineCharge, setMarineCharge] = useState(null);
  const [pdaServices, setpdaServices] = useState(null);
  const [charges, setCharges] = useState([]);
  const [subCharges, setSubCharges] = useState([]);

  const fetchPdaFile = async () => {
    if (pdaResponse?._id) {
      let data = { pdaId: pdaResponse?._id };
      try {
        const pdaFile = await getPdaFile(data);
        console.log("pdaFile", pdaFile);
        setPdfData(pdaFile);
      } catch (error) {
        console.error("Failed to fetch quotations:", error);
      }
    }
  };

  const fetchPdaDetails = async () => {
    let data = {
      pdaId: pdaResponse?._id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      console.log(pdaDetails, "pdaDetails_res");
      setPdaDetails(pdaDetails?.pda);
      setCompanyBankDetails(pdaDetails?.companyBankDetails);
      setAnchorageStayCharges(pdaDetails?.anchorageStayCharge);
      setMarineCharge(pdaDetails?.marineCharge);
      setpdaServices(pdaDetails?.pdaServices);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(pdaDetails, "pdaDetails");
    console.log(pdaServices, "pdaServices");
    console.log(anchorageStayCharges, "anchorageStayCharges");
    console.log(marineCharge, "marineCharge");
    console.log(companyBankDetails, "companyBankDetails");
  }, [
    pdaDetails,
    pdaServices,
    anchorageStayCharges,
    marineCharge,
    companyBankDetails,
  ]);

  useEffect(() => {
    console.log(open, "open");
    if (open == true) {
      setPdfData(null);
      fetchPdaFile();
      fetchPdaDetails();
    }
  }, [open]);

  useEffect(() => {
    console.log(pdfData, "pdfData");
  }, [pdfData]);

  const totalValues = pdaServices?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge?.quantity || 0, 10); // Default to 0 if null/undefined
      totals.customerOMR += parseFloat(charge?.customerOMR || 0);
      totals.customerVAT += parseFloat(charge?.customerVAT || 0);
      totals.customerTotalUSD += parseFloat(charge?.customerTotalUSD || 0);
      return totals;
    },
    { quantity: 0, customerOMR: 0, customerVAT: 0, customerTotalUSD: 0 }
  );

  const formattedTotals = {
    quantity: totalValues?.quantity,
    customerOMR: totalValues?.customerOMR?.toFixed(3),
    customerVAT: totalValues?.customerVAT?.toFixed(3),
    customerTotalUSD: totalValues?.customerTotalUSD?.toFixed(2),
  };

  const [fetchedCharges, setFetchedCharges] = useState(new Set());
  const [fetchedSubCharges, setFetchedSubCharges] = useState(new Set());

  // Fetch charges
  // useEffect(() => {
  //   const uniqueChargeIds = new Set(
  //     pdaServices?.map((service) => service.serviceId).filter(Boolean)
  //   );

  //   uniqueChargeIds.forEach((id) => {
  //     if (!fetchedCharges.has(id)) {
  //       fetchCharges(id);
  //     }
  //   });
  // }, [pdaServices, fetchedCharges]);

  // Fetch subcharges
  // useEffect(() => {
  //   const uniqueSubChargeIds = new Set(
  //     pdaServices?.map((service) => service.chargeId).filter(Boolean)
  //   );

  //   uniqueSubChargeIds.forEach((id) => {
  //     if (!fetchedSubCharges.has(id)) {
  //       fetchSubCharges(id);
  //     }
  //   });
  // }, [pdaServices, fetchedSubCharges]);

  // const fetchCharges = async (id) => {
  //   if (!fetchedCharges.has(id)) {
  //     try {
  //       const response = await getCharges({ serviceId: id });
  //       console.log(response, "fetchCharges");

  //       setCharges((prev) => [...prev, ...response?.charges]);
  //       setFetchedCharges((prev) => new Set(prev).add(id));
  //     } catch (error) {
  //       console.error("Error fetching charges:", error);
  //     }
  //   }
  // };

  // const fetchSubCharges = async (id) => {
  //   if (!fetchedSubCharges.has(id)) {
  //     try {
  //       const response = await getSubcharges({ chargeId: id });
  //       console.log(response, "fetchSubCharges");
  //       setSubCharges((prev) => [...prev, ...response?.subcharges]);
  //       setFetchedSubCharges((prev) => new Set(prev).add(id));
  //     } catch (error) {
  //       console.error("Error fetching subcharges:", error);
  //     }
  //   }
  // };

  const getItemName = (id, name) => {
    if (name === "subChargeType") {
      const subCharge = subCharges.find((s) => s._id === id);
      return subCharge ? subCharge.subchargeName : "Unknown subCharge";
    }
    if (name === "cargo") {
      const cargo = cargos?.find((s) => s._id === id);
      return cargo ? cargo.cargoName : "Unknown cargo";
    }
    if (name === "vessel") {
      const vessel = vessels?.find((s) => s._id === id);
      return vessel ? vessel.vesselName : "Unknown vessel";
    }
    if (name === "port") {
      const port = ports?.find((s) => s._id === id);
      return port ? port.portName : "Unknown port";
    }
    if (name === "customer") {
      const customer = customers?.find((s) => s._id === id);
      if (customer) {
        return {
          name: customer.customerName,
          addressLines: customer.customerAddress?.split("\n") || [],
        };
      }
    }
  };

  useEffect(() => {
    console.log(fetchedSubCharges, "fetchedSubCharges");
    console.log(subCharges, "subCharges");
  }, [fetchedSubCharges, subCharges]);

  const getPDF = async () => {
    let payload = {
      pdaId: pdaResponse?._id,
    };

    console.log(payload, "payload_getReport");
    try {
      const response = await getPdaFile(payload);
      console.log("getPdaFile", response);
      if (response?.pdfPath) {
        const pdfUrl = `${response.pdfPath}`;
        // Fetch the PDF as a Blob
        const pdfResponse = await fetch(pdfUrl);
        const pdfBlob = await pdfResponse.blob();
        const pdfBlobUrl = URL.createObjectURL(pdfBlob);
        // Create a hidden anchor tag to trigger the download
        const link = document.createElement("a");
        link.href = pdfBlobUrl;
        link.setAttribute("download", "PDA.pdf"); // Set the file name
        document.body.appendChild(link);
        link.click();
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfBlobUrl);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  return (
    <>
      <Dialog
        sx={{
          width: 1250,
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
        PaperProps={{
          style: { width: "1700px" }, // Custom width
        }}
      >
        <div className="d-flex justify-content-between" onClick={onClose}>
          <DialogTitle></DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent>
          <div className="col-12 d-flex justify-content-end my-2 ">
            <button
              className="btn btn-info filbtnjob"
              onClick={() => {
                getPDF();
              }}
            >
              Download PDF
            </button>
          </div>

          <div>
            <img className="header-image" src={headerPreview}></img>
          </div>
          <table className="tabstyle">
            <thead className="tableheading">
              <tr>
                <th colSpan="5" className="styltwo">
                  To :{" "}
                  {pdaDetails?.customerId
                    ? (() => {
                        const customer = getItemName(
                          pdaDetails.customerId,
                          "customer"
                        );
                        return (
                          <div>
                            <div>{customer?.name}</div>
                            {customer?.addressLines.map((line, idx) => (
                              <div key={idx}>{line}</div>
                            ))}
                          </div>
                        );
                      })()
                    : "N/A"}
                </th>

                <th className="stylthree">
                  <div>
                    Date:{" "}
                    {new Date(pdaDetails?.createdAt).toLocaleDateString(
                      "en-GB"
                    )}
                  </div>
                  <div>PDA No : {pdaDetails?.pdaNumber}</div>
                </th>
                <th className="stylfour"></th>
              </tr>
            </thead>
          </table>
          <table className="tabstyle">
            <thead className="tableheading">
              <tr>
                <th colspan="3" className="stylfive">
                  VESSEL
                </th>

                <th className="stylsix">LOCATION</th>
                <th className="stylseven">ETA</th>
                <th className="styleight">ETD</th>
                <th className="stylnine">CARGO</th>
                <th className="stylten">LOA</th>
                <th className="styla"></th>
              </tr>
              <tr>
                <th colspan="3" className="mvstyl">
                  {" "}
                  {pdaDetails?.vesselId
                    ? getItemName(pdaDetails?.vesselId, "vessel")
                    : "N/A"}
                </th>

                <th className="mvstyl">
                  {pdaDetails?.portId
                    ? getItemName(pdaDetails?.portId, "port")
                    : "N/A"}
                </th>
                <th className="mvstyl">
                  {pdaDetails?.ETA
                    ? moment.utc(pdaDetails.ETA).format("DD-MM-YYYY HH:mm")
                    : "N/A"}{" "}
                </th>
                <th className="mvstyl">
                  {" "}
                  {pdaDetails?.ETD
                    ? moment.utc(pdaDetails.ETD).format("DD-MM-YYYY HH:mm")
                    : "N/A"}{" "}
                </th>
                <th className="mvstyl">
                  {" "}
                  {pdaDetails?.cargoId
                    ? getItemName(pdaDetails?.cargoId, "cargo")
                    : "N/A"}
                </th>
                <th className="mvstyl">
                  {pdaDetails?.LOA === 0 ? "N/A" : pdaDetails?.LOA}
                </th>
                <th className="stylee "></th>
              </tr>
              <tr>
                <th colspan="3" className="mvstyl">
                  GRT
                </th>

                <th className="stylee">
                  {pdaDetails?.GRT === 0 ? "N/A" : pdaDetails?.GRT}
                </th>
                <th className="mvstyl"> NRT</th>
                <th className="mvstyl">
                  {pdaDetails?.NRT === 0 ? "N/A" : pdaDetails?.NRT}
                </th>
                <th className="mvstyl"></th>
                <th className="mvstyl"></th>
                <th className="stylb"></th>
              </tr>
            </thead>
          </table>
          <table className="tabstyle">
            <thead className="tableheading">
              <tr>
                <th className="slstyl">Sl.No</th>
                <th className="slstyl">Particulars</th>
                <th className="slstyl">Quantity</th>
                <th className="omrstyl">Amount (OMR)</th>
                <th className="omrstyl">VAT AMOUNT</th>
                <th className="omrstyl">TOTAL AMOUNT (OMR)</th>
                <th className="omrstyl">TOTAL AMOUNT (USD)</th>
              </tr>
            </thead>
            <tbody className="tablebody">
              {pdaServices?.length > 0 &&
                pdaServices.map((charge, index) => (
                  <>
                    <tr key={index}>
                      <td className="stylc">{index + 1}</td>
                      <td className="stylc">
                        {charge?.subchargeId?.subchargeName}
                      </td>
                      <td className="stylq">{charge?.quantity}</td>

                      <td className="stylq">
                        {charge?.customerOMR?.toFixed(3)}
                      </td>
                      <td className="stylq">
                        {charge?.customerVAT?.toFixed(3)}
                      </td>
                      <td className="stylq">
                        {(
                          parseFloat(charge?.customerOMR) +
                          parseFloat(charge?.customerVAT)
                        )?.toFixed(3)}
                      </td>
                      <td className="stylq">
                        {charge?.customerTotalUSD?.toFixed(3)}
                      </td>
                    </tr>
                    {charge?.remark && (
                      <>
                        <tr>
                          <td className="stylc"></td>
                          <td colspan="6" className="stylg ">
                            {charge?.remark}
                          </td>
                        </tr>
                      </>
                    )}
                  </>
                ))}

              <tr>
                <td colspan="5" className="stylh">
                  TOTAL AMOUNT
                </td>

                <td className="stylt">
                  {(
                    parseFloat(formattedTotals?.customerOMR) +
                    parseFloat(formattedTotals?.customerVAT)
                  )?.toFixed(2)}
                </td>
                <td className="stylt">{formattedTotals?.customerTotalUSD}</td>
              </tr>
            </tbody>
          </table>
          <div>
            <div className="col-1 note">Note</div>
            <div className="subnote">
              **“Effective from 16th April 2021, 5% of VAT will applicable as
              per new Government regulation in the Sultanate of Oman."
              <br />
              ***Denotes estimated charges and actual as per port bills <br />
              ****Agency fess does not include Immarsat calls or telexes. If
              necessary will be charged out of costs
            </div>
          </div>

          {anchorageStayCharges?.length > 0 &&
            pdaResponse?.isVessels == true && (
              <>
                <table className="styli">
                  <thead className="tableheading">
                    <tr>
                      <th className="slstyl"></th>
                      <th colSpan="4" className="stylj">
                        Anchorage Stay Charge
                      </th>
                    </tr>
                    <tr>
                      <th className="stylk">SI NO</th>
                      <th className="stylk">Days</th>
                      <th className="styll">Description</th>
                      <th className="stylk">OMR</th>
                      <th className="stylk">USD</th>
                    </tr>
                  </thead>
                  <tbody className="tablebody">
                    {anchorageStayCharges.map((item, index) => (
                      <tr key={item._id}>
                        <td className="stylk">{index + 1}</td>
                        <td className="stylk">{item?.days}</td>
                        <td className="stylm">{item?.description}</td>
                        <td className="stylq">{item?.chargeOMR?.toFixed(3)}</td>
                        <td className="stylq">{item?.chargeUSD?.toFixed(2)}</td>
                      </tr>
                    ))}

                    <tr>
                      <td colSpan="6" className="styln">
                        Vessels waiting at anchorage due non-availability of
                        berth shall not be charged anchorage fees.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </>
            )}

          {marineCharge?.length > 0 && pdaResponse?.isVessels == true && (
            <>
              <div className="my-2">
                <table className="styli">
                  <thead className="tableheading">
                    <tr>
                      <th className="slstyl"></th>
                      <th colSpan="4" className="stylj">
                        Anchorage Stay Charges
                      </th>
                    </tr>
                    <tr>
                      <th className="stylk">SI NO</th>
                      <th className="styll">Duration</th>
                      <th className="stylk">
                        North Anchorage per day or part thereof <br></br> ( max
                        permitted draft 9 M )
                      </th>
                      <th className="stylk">
                        Anchorage charge for A,B,C and D per 24 hours or part
                        thereof for vessels arriving for cargo operations
                      </th>
                      <th className="stylk">
                        Anchorage charge for A,B,C and D per 24 hours or part
                        thereof for vessels arriving for noncargo operations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tablebody">
                    {marineCharge.map((item, index) => (
                      <tr key={item?._id}>
                        <td className="stylk">{index + 1}</td>
                        <td className="stylk">{item?.duration}</td>
                        <td className="stylm">{item?.northAnchorageCharge}</td>
                        <td className="stylq">{item?.cargoAnchorageCharge}</td>
                        <td className="stylq">
                          {item?.noncargoAnchorageCharge}
                        </td>
                      </tr>
                    ))}

                    <tr>
                      <td colSpan="6" className="styln">
                        Vessels waiting at anchorage due non-availability of
                        berth shall not be charged anchorage fees.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div>
            <div className="payment">
              Payment:
              <br /> Payment in advance prior to vessel arrival as per below
              bank account details:
              <br /> OUR BANKING ACCOUNT DETAILS
              <br /> TRANS OCEAN MARITIME SERVICES LLC
              <br /> {companyBankDetails?.bankName}
              <br /> {companyBankDetails?.bankAddress}
              <br /> A/C NUMBER:- {companyBankDetails?.accountNumberOMR} (OMR)
              <br /> IBAN:- {companyBankDetails?.ibanOMR} (OMR)
              <br /> A/C NUMBER:-{companyBankDetails?.accountNumberUSD} (USD)
              <br /> IBAN:- {companyBankDetails?.ibanUSD} (USD)
              <br /> SWIFT CODE: - {companyBankDetails?.swiftCode}
            </div>
          </div>
          <table className="tabstyle">
            <thead>
              <tr>
                <th colspan="12" className=" tableimage ">
                  <img className="footimg" src={footerPreview}></img>
                </th>
              </tr>
            </thead>
          </table>
        </DialogContent>
      </Dialog>
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default PdaDialog;
