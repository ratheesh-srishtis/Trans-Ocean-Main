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
import "../css/invoicepdf.css";
import { getPdaFile, getPdaDetails } from "../services/apiService";
import moment from "moment";
import PopUp from "./PopUp";
import { useMedia } from "../context/MediaContext";
const InvoicePdf = ({
  open,
  onClose,
  services,
  customers,
  ports,
  pdaResponse,
  vendors,
  vessels,
  cargos,
  selectedPdaData,
}) => {
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [vatinNumber, setVatinNumber] = useState("");
  const [pdfData, setPdfData] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [pdaDetails, setPdaDetails] = useState(null);
  const [pdaServices, setpdaServices] = useState(null);
  const [charges, setCharges] = useState([]);
  const [subCharges, setSubCharges] = useState([]);
  const { logoPreview, headerPreview, footerPreview } = useMedia() || {};

  // const [fetchedCharges, setFetchedCharges] = useState(new Set());
  // const [fetchedSubCharges, setFetchedSubCharges] = useState(new Set());
  const fetchPdaFile = async () => {
    if (pdaResponse?._id) {
      setIsLoading(true);
      let data = { pdaId: pdaResponse?._id };
      try {
        const pdaFile = await getPdaFile(data);
        console.log("pdaFile", pdaFile); // Use pdaFile directly
        setPdfData(pdaFile); // Update state for future renders
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch quotations:", error);
        setIsLoading(false);
      }
    }
  };

  const fetchPdaDetails = async () => {
    let data = {
      pdaId: pdaResponse?._id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      console.log(pdaDetails, "pdaDetails");
      setVatinNumber(pdaDetails?.vat);

      setPdaDetails(pdaDetails?.pda);
      setpdaServices(pdaDetails?.pdaServices);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    console.log(pdaDetails, "pdaDetails");
    console.log(pdaServices, "pdaServices");
  }, [pdaDetails, pdaServices]);

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

  // const getItemName = (id, name) => {
  //   // if (name === "service") {
  //   //   if (id) {
  //   //     fetchCharges(id);
  //   //   }
  //   //   const service = services?.find((s) => s._id === id);
  //   //   return service ? service.serviceName : "Unknown Service";
  //   // } else if (name === "customer") {
  //   //   const customer = customers?.find((s) => s._id === id);
  //   //   return customer ? customer.customerName : "Unknown Customer";
  //   // } else if (name === "vendor") {
  //   //   const vendor = vendors?.find((s) => s._id === id);
  //   //   return vendor ? vendor.vendorName : "Unknown vendor";
  //   // } else if (name === "vessel") {
  //   //   const vessel = vessels?.find((s) => s._id === id);
  //   //   return vessel ? vessel.vesselName : "Unknown vessel";
  //   // } else if (name === "port") {
  //   //   const port = ports?.find((s) => s._id === id);
  //   //   return port ? port.portName : "Unknown port";
  //   // } else if (name === "cargo") {
  //   //   const cargo = cargos?.find((s) => s._id === id);
  //   //   return cargo ? cargo.cargoName : "Unknown cargo";
  //   // } else if (name === "chargeType") {
  //   //   if (id) {
  //   //     fetchSubCharges(id);
  //   //   }
  //   //   const charge = charges.find((s) => s._id === id);
  //   //   return charge ? charge.chargeName : "Unknown charge";
  //   // } else

  //   if (name === "subChargeType") {
  //     const subCharge = subCharges.find((s) => s._id === id);
  //     return subCharge ? subCharge.subchargeName : "Unknown subCharge";
  //   }
  // };

  // const fetchCharges = async (id) => {
  //   if (id) {
  //     if (!fetchedCharges.has(id)) {
  //       try {
  //         const response = await getCharges({
  //           serviceId: id,
  //         });
  //         setCharges((prev) => [...prev, ...response?.charges]);
  //         setFetchedCharges((prev) => new Set(prev).add(id));
  //         console.log("Fetched Charges:", response);
  //       } catch (error) {
  //         console.error("Error fetching charges:", error);
  //       }
  //     }
  //   }
  // };

  // const fetchSubCharges = async (id) => {
  //   console.log(id, "fetchSubCharges_ID_PDADIALOG");
  //   if (id) {
  //     if (!fetchedSubCharges.has(id)) {
  //       alert("fetchSubCharges pda ");
  //       try {
  //         const response = await getSubcharges({
  //           chargeId: id,
  //         });
  //         setSubCharges((prev) => [...prev, ...response?.subcharges]);
  //         setFetchedSubCharges((prev) => new Set(prev).add(id));
  //         console.log("Fetched SubCharges:", response);
  //       } catch (error) {
  //         console.error("Error fetching subcharges:", error);
  //       }
  //     }
  //   }
  // };

  const totalValues = pdaServices?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge.quantity || 0, 10); // Default to 0 if null/undefined
      totals.customerOMR += parseFloat(charge.customerOMR || 0);
      totals.customerVAT += parseFloat(charge.customerVAT || 0);
      totals.customerTotalUSD += parseFloat(charge.customerTotalUSD || 0);
      return totals;
    },
    { quantity: 0, customerOMR: 0, customerVAT: 0, customerTotalUSD: 0 }
  );

  const formattedTotals = {
    quantity: totalValues?.quantity,
    customerOMR: totalValues?.customerOMR.toFixed(3),
    customerVAT: totalValues?.customerVAT.toFixed(3),
    customerTotalUSD: totalValues?.customerTotalUSD.toFixed(2),
  };

  // const [fetchedCharges, setFetchedCharges] = useState(new Set());
  // const [fetchedSubCharges, setFetchedSubCharges] = useState(new Set());

  // // Fetch charges
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

  // // Fetch subcharges
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
      return customer ? customer.customerName : "Unknown Customer";
    }
  };

  // useEffect(() => {
  //   console.log(fetchedSubCharges, "fetchedSubCharges");
  //   console.log(subCharges, "subCharges");
  // }, [fetchedSubCharges, subCharges]);

  const vendorTotalValues = pdaServices?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge.quantity || 0, 10); // Default to 0 if null/undefined
      totals.vendorOMR += parseFloat(charge.vendorOMR || 0);
      totals.vendorVAT += parseFloat(charge.vendorVAT || 0);
      totals.vendorTotalUSD += parseFloat(charge.vendorTotalUSD || 0);
      return totals;
    },
    { quantity: 0, vendorOMR: 0, vendorVAT: 0, vendorTotalUSD: 0 }
  );

  const formattedVendorTotals = {
    quantity: vendorTotalValues?.quantity,
    vendorOMR: vendorTotalValues?.vendorOMR.toFixed(3),
    vendorVAT: vendorTotalValues?.vendorVAT.toFixed(3),
    vendorTotalUSD: vendorTotalValues?.vendorTotalUSD.toFixed(2),
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
          <div>
            <img className="header-image" src={headerPreview}></img>
          </div>
          <table className="column">
            <thead className="tablebody">
              <tr>
                <th className="taxinvoice ">
                  <span className="tax">TAX INVOICE</span>
                  <span className="vatin">VATIN {vatinNumber}</span>
                </th>
              </tr>
            </thead>
          </table>
          <table className="column">
            <thead className=".tablebody">
              <tr>
                <th colspan="5" className="totba">
                  To :{" "}
                  {pdaDetails?.customerId
                    ? getItemName(pdaDetails?.customerId, "customer")
                    : ""}
                </th>

                <th className="codefda">FDA CODE : {pdaDetails?.invoiceId}</th>

                <th className="tabl">
                  <table className="column">
                    <tr>
                      <th className=" dateinvoice">
                        <div>Date :</div>
                        <div>
                          {" "}
                          {new Date(pdaDetails?.createdAt).toLocaleDateString(
                            "en-GB"
                          )}
                        </div>
                      </th>
                    </tr>
                    <tr>
                      <th className=" ref">
                        <div>Ref :</div>
                        <div>{pdaDetails?.jobId}</div>
                      </th>
                    </tr>
                  </table>
                </th>
              </tr>
            </thead>
          </table>
          <table className="column">
            <thead className="tablebody">
              <tr>
                <th colspan="3" className="vesselpdf">
                  VESSEL
                </th>

                <th className="location">LOCATION</th>
                <th rowspan="2" className="stilefive">
                  VESSEL ARRIVED :{" "}
                  {moment.utc(pdaDetails?.ETA).format("DD-MM-YYYY HH:mm")}
                </th>
                <th rowspan="2" className="stilefive">
                  VESSEL SAILED :{" "}
                  {moment.utc(pdaDetails?.ETD).format("DD-MM-YYYY HH:mm")}
                </th>
              </tr>
              <tr>
                <th colspan="3" className="stilefive">
                  {pdaDetails?.vesselId
                    ? getItemName(pdaDetails?.vesselId, "vessel")
                    : ""}
                </th>

                <th className="stilefive">
                  {" "}
                  {pdaDetails?.portId
                    ? getItemName(pdaDetails?.portId, "port")
                    : ""}
                </th>
              </tr>
            </thead>
          </table>
          <table className="column">
            <thead style={{ fontSize: "12px" }}>
              <tr>
                <th className="stilefour">Sl.No</th>
                <th className="stilefour">Particulars</th>
                <th className="stilefour">Quantity</th>
                <th className="stilethree">Amount (OMR)</th>
                <th className="stilethree">VAT AMOUNT</th>
                <th className="stilethree">TOTAL AMOUNT (OMR)</th>
                <th className="stilethree">TOTAL AMOUNT (USD)</th>
              </tr>
            </thead>
            <tbody className="tableheading">
              {pdaServices?.length > 0 &&
                pdaServices.map((charge, index) => (
                  <>
                    <tr key={index}>
                      <td className="stiletwo">{index + 1}</td>
                      <td className="stiletwo">
                        {charge.subchargeId
                          ? getItemName(charge.subchargeId, "subChargeType")
                          : ""}
                      </td>
                      <td className="stiletwo">{charge?.quantity}</td>

                      <td className="stileone">
                        {charge.customerOMR.toFixed(3)}
                      </td>
                      <td className="stileone">
                        {charge.customerVAT.toFixed(3)}
                      </td>
                      <td className="stileone">
                        {(
                          parseFloat(charge.customerOMR) +
                          parseFloat(charge.customerVAT)
                        ).toFixed(3)}
                      </td>
                      <td className="stileone">
                        {charge.customerTotalUSD.toFixed(2)}
                      </td>
                    </tr>
                    {charge?.remark && (
                      <>
                        <tr>
                          <td className="stileone"></td>
                          <td colspan="6" className="stylg ">
                            {charge?.remark}
                          </td>
                        </tr>
                      </>
                    )}
                  </>
                ))}

              <tr>
                <td colspan="6" className="amount">
                  TOTAL VAT AMOUNT
                </td>

                <td className="amount">{formattedVendorTotals.vendorVAT}</td>
              </tr>
              <tr>
                <td colspan="6" className="amount">
                  TOTAL AMOUNT IN OMR
                </td>

                <td className="amount">{formattedVendorTotals.vendorOMR}</td>
              </tr>
              <tr>
                <td colspan="6" className="amount">
                  TOTAL AMOUNT IN USD
                </td>

                <td className="amount">
                  {formattedVendorTotals.vendorTotalUSD}
                </td>
              </tr>
            </tbody>
          </table>
          <div>
            <div className=" ">Note</div>
            <div className="subnote">
              *Payment due within 3days of invoicing
              <br />
              *2% interest/month shall be charged if the payment is not made
              with in the due date.
              <br />
              *Our standard terms and conditons apply, copy available upon
              request
            </div>
          </div>

          <div>
            <div className="payment">
              Ple/ase remit to the following bank account with advice to us
              <br /> Kindly find our OMR account in below
              <br /> OUR BANKING ACCOUNT DETAILS
              <br /> TRANS OCEAN MARITIME SERVICES LLC
              <br /> BANK MUSCAT
              <br /> FALAJ AL QABAIL SOHAR, SULTANATE OF OMAN
              <br /> A/C NUMBER:- 0423061688920014 (OMR)
              <br /> A/C NUMBER:- 0423061688920022 (USD)
              <br /> SWIFT CODE: - BMUSOMRXXXX
            </div>
          </div>
          <table className="tabstyle">
            <thead>
              <tr>
                <th colspan="6" className=" tableimage ">
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

export default InvoicePdf;
