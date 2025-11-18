// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  generateCustomerVoucherPDF,
  generateVendorVoucherPDF,
  getVendorVoucherDetails,
  generateVoucherPDF,
} from "../../services/apiPayment";
import { saveAs } from "file-saver";
import "../../css/viewvoucher.css";
import moment from "moment";
import { useMedia } from "../../context/MediaContext";
import { get } from "jquery";

const { ToWords } = require("to-words");

const toWords = new ToWords();
const ViewVendorVoucher = ({ open, onClose, getvoucher }) => {
  const [voucher, setVoucherNumber] = useState("");
  const [vendorVoucher, setVendorVoucher] = useState("");
  const [through, setThrough] = useState("");
  const [amount, setAmount] = useState("");
  const [particulars, setParticulars] = useState("");
  const [accountof, setAccountof] = useState("");
  const [dateofPay, setDateofPay] = useState("");
  const [pdaNumber, setPdaNumber] = useState("");
  const [jobId, setJobId] = useState("");
  const { logoPreview, headerPreview, footerPreview } = useMedia() || {};

  useEffect(() => {
    if (getvoucher) {
      console.log(getvoucher, "getvoucher");
      setVoucherNumber(getvoucher.voucherNumber);
      setThrough(getvoucher.throughs);
      setAmount(getvoucher.recvamount);
      setParticulars(getvoucher.particulars);
      setAccountof(getvoucher.accountof);
      setDateofPay(getvoucher.dateofPay);
      setPdaNumber(getvoucher?.pdaIds?.pdaNumber);
      setJobId(getvoucher?.jobId);
    }
  }, [getvoucher]);
  // const getWordRepresentation = (value, currency) => {
  //   if (
  //     value === undefined ||
  //     value === null ||
  //     isNaN(Number(value)) ||
  //     value === "N/A" ||
  //     value === ""
  //   ) {
  //     return "Zero";
  //   }

  //   const amount = Number(value);
  //   const integerPart = Math.floor(amount);
  //   const fractionPart = Math.round((amount - integerPart) * 100); // 2 decimal places

  //   const amountInWords = toWords.convert(integerPart);

  //   let currencyFullName = "";
  //   let currencyUnit = "";
  //   let subUnit = "";

  //   switch (currency?.toUpperCase()) {
  //     case "USD":
  //       currencyFullName = "United States Dollar";
  //       currencyUnit = "Dollars";
  //       subUnit = "Cents";
  //       break;
  //     case "OMR":
  //       currencyFullName = "Omani Riyal";
  //       currencyUnit = "Riyal";
  //       subUnit = "Baisa";
  //       break;
  //     case "AED":
  //       currencyFullName = "Dirham";
  //       currencyUnit = "Dirhams";
  //       subUnit = "Fils";
  //       break;
  //     default:
  //       currencyFullName = currency;
  //       currencyUnit = "";
  //       subUnit = "";
  //   }

  //   let result = `${currencyFullName} ${amountInWords}`;

  //   if (fractionPart > 0) {
  //     const fractionInWords = toWords.convert(fractionPart);
  //     result += ` and ${fractionInWords} ${subUnit}`;
  //   }

  //   return `${result} Only`;
  // };
  const getWordRepresentation = (value, currency) => {
    // Guard clauses
    if (
      value === undefined ||
      value === null ||
      value === "N/A" ||
      value === "" ||
      isNaN(Number(value))
    ) {
      return "Zero Only";
    }

    let amount = Number(value);

    // handle negative by treating absolute (remove if you want to keep negative sign)
    const isNegative = amount < 0;
    amount = Math.abs(amount);

    // split integer & fraction (2 decimal places)
    let integerPart = Math.floor(amount);
    let fractionPart = Math.round((amount - integerPart) * 100);

    // handle rounding edge (e.g. 1.999 -> 2.00)
    if (fractionPart === 100) {
      integerPart += 1;
      fractionPart = 0;
    }

    // convert numbers to words (expects toWords.convert to exist)
    const intWords = integerPart === 0 ? "zero" : toWords.convert(integerPart);
    const fracWords = fractionPart > 0 ? toWords.convert(fractionPart) : "";

    // currency map: singular base forms (we'll add 's' for plural where applicable)
    const map = {
      USD: { fullName: null, unit: "Dollar", subUnit: "Cent" },
      OMR: { fullName: "Omani Riyal", unit: "Riyal", subUnit: "Baisa" },
      AED: { fullName: null, unit: "Dirham", subUnit: "Fils" },
      // add more currencies here if needed
    };

    const key = (currency || "").toUpperCase();
    const cfg = map[key] || {
      fullName: currency || "",
      unit: currency || "",
      subUnit: "",
    };

    // Decide output format:
    // - For currencies with a fullName in the map (like OMR) we prefix with it and do NOT append unit after integer words,
    //   matching your OMR example: "Omani Riyal One Hundred Fifty And Fifty Baisa Only"
    // - Otherwise we show "<AmountWords> <Unit(s)> [And <FracWords> <SubUnit(s)>] Only"
    const capitalizeWords = (str) =>
      String(str || "")
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    let result = "";

    if (cfg.fullName) {
      // Prefix with the full currency name (e.g., "Omani Riyal")
      result = `${cfg.fullName} ${intWords}`;
      if (fractionPart > 0) {
        const sub = fractionPart === 1 ? cfg.subUnit : cfg.subUnit; // subUnit usually doesn't add 's' (e.g., "Baisa")
        result += ` And ${fracWords} ${sub}`;
      }
    } else {
      // Standard: number words + unit (pluralize if needed)
      const unit =
        integerPart === 1
          ? cfg.unit
          : `${cfg.unit}${cfg.unit.endsWith("s") ? "" : "s"}`; // Dollar -> Dollars
      result = `${intWords} ${unit}`;
      if (fractionPart > 0) {
        const subUnit =
          fractionPart === 1
            ? cfg.subUnit
            : `${cfg.subUnit}${cfg.subUnit.endsWith("s") ? "" : "s"}`; // Cent -> Cents
        result += ` And ${fracWords} ${subUnit}`;
      }
    }

    // add negative marker if needed
    if (isNegative) result = `Minus ${result}`;

    // Final "Only", and capitalize words as in your examples
    result = `${result} Only`;
    return capitalizeWords(result);
  };
  const downloadVoucher = async () => {
    try {
      let payload = {
        // paymentId: getvoucher?.id,
        pdaId: getvoucher?.pdaIds["_id"],
        voucherNo: getvoucher?.voucherNumber,
      };
      console.log("Payload for PDF generation:", payload);
      const voucherPdf = await generateVendorVoucherPDF(payload);
      const fileUrl = process.env.REACT_APP_ASSET_URL + voucherPdf.pdfPath;
      const fileName = "Vendor Payment Voucher.pdf";
      // Fetch the file and save it
      fetch(fileUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          if (blob.type !== "application/pdf") {
            throw new Error("File is not a PDF");
          }
          saveAs(blob, fileName);
        })
        .catch((error) => console.error("Download error:", error));
    } catch (error) {
      console.error("Error fetching the voucher PDF:", error);
    }
  };

  const getVoucherDetails = async () => {
    try {
      let data = {
        pdaId: getvoucher?.pdaIds["_id"],
        voucherNo: getvoucher?.voucherNumber,
      }; // Adjust the payload as needed
      const response = await getVendorVoucherDetails(data);
      setVendorVoucher(response);
      console.log("Voucher Details:", response);
      // Handle the response as needed
    } catch (error) {
      console.error("Error fetching voucher details:", error);
    }
  };

  useEffect(() => {
    if (getvoucher?.pdaIds["_id"] && getvoucher?.voucherNumber) {
      getVoucherDetails();
    }
  }, [getvoucher]);

  useEffect(() => {
    console.log("Vendor Voucher State Updated:", vendorVoucher);
  }, [vendorVoucher]);

  return (
    <>
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
        <div className="d-flex justify-content-between ">
          <DialogTitle></DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg " onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <div className="">
            <div>
              <img className="header-image" src={headerPreview}></img>
            </div>
            <div className="voucherpadding">
              <div className=" headheadvoucher">
                <div className="headvoucher">VENDOR VOUCHER</div>

                <div className="downloadbutnvoucher">
                  <button
                    className="btn btn-info infobtn"
                    onClick={downloadVoucher}
                  >
                    {" "}
                    Download Voucher
                  </button>
                </div>
              </div>
              <div className="voucherdateandnumber">
                <div>No: {voucher}</div>
                {/* <div>Date: {dateofPay}</div> */}
              </div>
              <table>
                <thead>
                  <tr>
                    <th className="voucherpart text-center">Particulars</th>
                    <th className="voucherpartone text-center"> Amounts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="voucherpartthree"></td>
                    <td className="voucherpartfour"></td>
                  </tr>
                  <tr>
                    <td className="voucheraccount">
                      Account:
                      <p className="voucherprint">
                        {pdaNumber}{" "}
                        {jobId && jobId !== "N/A" ? ` - ${jobId}` : ""}
                      </p>
                      <p className="voucherprint">
                        {getvoucher?.vendorId?.vendorName}
                      </p>
                    </td>
                    <td className="voucherpartfour"></td>
                  </tr>

                  {vendorVoucher?.payment?.length > 0 && (
                    <>
                      {vendorVoucher?.payment?.map((payment, index) => (
                        <tr key={index}>
                          <td className="voucherpartthree">
                            <div className="voucheraccount">
                              Payment Date :
                              <div className="voucherprintingnew">
                                {" "}
                                {moment
                                  .utc(payment?.paymentDate)
                                  .format("DD-MM-YYYY")}
                              </div>
                              <div className="voucherprintingnew">
                                Mode Of Payment :
                                {payment?.modeofPayment
                                  ? payment?.modeofPayment
                                      .charAt(0)
                                      .toUpperCase() +
                                    payment?.modeofPayment.slice(1)
                                  : ""}
                              </div>
                              <div className="voucherprintingnew">
                                {payment?.bank?.bankName}
                              </div>
                            </div>
                          </td>

                          <td className="voucherpartfour text-center">
                            {payment?.currency?.toUpperCase()}{" "}
                            {payment?.currency?.toUpperCase() === "OMR"
                              ? Number(payment?.amount).toFixed(3)
                              : payment?.currency?.toUpperCase() === "USD"
                              ? Number(payment?.amount).toFixed(2)
                              : payment?.amount}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  <tr>
                    <td className="voucherpartthree">
                      <div className="voucheraccount">
                        Mode Of Payment :
                        <div className="voucherprintingnew">
                          {getvoucher?.modeofPayment
                            ? getvoucher.modeofPayment.charAt(0).toUpperCase() +
                              getvoucher.modeofPayment.slice(1)
                            : ""}
                        </div>
                      </div>
                      {getvoucher?.modeofPayment === "bank" && (
                        <>
                          <div className="voucherprintingnew2">
                            Bank :{getvoucher?.bank?.bankName}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="voucherpartfour align-baseline">
                      {" "}
                      {getvoucher?.recvamount}
                    </td>
                  </tr>

                  <tr>
                    <td className="voucheraccount">Amount(in words):</td>
                    <td className="voucherpartfour"></td>
                  </tr>
                  <tr>
                    <td className="voucherprinting">
                      {getWordRepresentation(
                        vendorVoucher?.totalOMR,
                        vendorVoucher?.currency
                      )}{" "}
                    </td>
                    <td className="voucheramountrate text-center">
                      {vendorVoucher?.currency?.toUpperCase()}{" "}
                      {vendorVoucher?.currency === "OMR"
                        ? Number(vendorVoucher?.totalOMR).toFixed(3)
                        : vendorVoucher?.currency === "USD"
                        ? Number(vendorVoucher?.totalOMR).toFixed(2)
                        : vendorVoucher?.totalOMR}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <table className="tabstyle">
            <thead>
              <tr>
                <th colspan="12" className=" tableimage ">
                  <img className="footimgviewvoucher" src={footerPreview}></img>
                </th>
              </tr>
            </thead>
          </table>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewVendorVoucher;
