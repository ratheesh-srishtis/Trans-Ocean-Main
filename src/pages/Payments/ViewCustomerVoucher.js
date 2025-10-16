// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  generateCustomerVoucherPDF,
  generateVoucherPDF,
  getCustomerVoucherDetails,
} from "../../services/apiPayment";
import { saveAs } from "file-saver";
import "../../css/viewvoucher.css";
import moment from "moment";
import { useMedia } from "../../context/MediaContext";
const { ToWords } = require("to-words");
const toWords = new ToWords();

const ViewCustomerVoucher = ({ open, onClose, getvoucher }) => {
  const [voucher, setVoucherNumber] = useState("");
  const [through, setThrough] = useState("");
  const [amount, setAmount] = useState("");
  const [particulars, setParticulars] = useState("");
  const [accountof, setAccountof] = useState("");
  const [dateofPay, setDateofPay] = useState("");
  const [pdaNumber, setPdaNumber] = useState("");
  const [jobId, setJobId] = useState("");
  const [customerVoucher, setCustomerVoucher] = useState("");
  const { logoPreview, headerPreview, footerPreview } = useMedia() || {};

  const getWordRepresentation = (value, currency) => {
    if (
      value === undefined ||
      value === null ||
      isNaN(Number(value)) ||
      value === "N/A" ||
      value === ""
    ) {
      return "Zero";
    }

    const amountInWords = toWords.convert(Number(value)); // "One Hundred"

    let currencyFullName = "";
    let currencyUnit = "";

    switch (currency?.toUpperCase()) {
      case "USD":
        currencyFullName = "United States Dollar";
        currencyUnit = "Dollars";
        break;
      case "OMR":
        currencyFullName = "Omani Riyal";
        currencyUnit = "Riyals";
        break;
      default:
        currencyFullName =
          currency?.toUpperCase() === "AED" ? "Dirham" : currency;
        currencyUnit = "";
    }

    return `${currencyFullName} ${amountInWords} ${currencyUnit} Only`;
  };

  const downloadVoucher = async () => {
    try {
      let payload = {
        pdaId: getvoucher?.pdaIds?._id,
        voucherNo: getvoucher?.voucherNumber,
      };
      const voucherPdf = await generateCustomerVoucherPDF(payload);
      console.log(voucherPdf, "voucherPdf");
      // Remove leading slash if present
      const pdfPath =
        voucherPdf.pdfPath && voucherPdf.pdfPath.startsWith("/")
          ? voucherPdf.pdfPath.substring(1)
          : voucherPdf.pdfPath;
      const fileUrl = process.env.REACT_APP_ASSET_URL + pdfPath;
      const fileName = "Customer Voucher.pdf";
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

  const getCustomerVoucher = async (payload) => {
    try {
      const response = await getCustomerVoucherDetails(payload);
      setCustomerVoucher(response);
      console.log(response, "response_getCustomerVoucher");
    } catch (error) {
      console.log("Error in Api", error);
    }
  };

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
      getCustomerVoucher({
        pdaId: getvoucher?.pdaIds?._id,
        voucherNo: getvoucher.voucherNumber,
      });
    }
  }, [getvoucher]);

  useEffect(() => {
    console.log(customerVoucher, "customerVoucher");
  }, [customerVoucher]);

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
        <div className="d-flex justify-content-between " onClick={onClose}>
          <DialogTitle></DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <div className="">
            <div>
              <img className="header-image" src={headerPreview}></img>
            </div>
            <div className="voucherpadding">
              <div className=" headheadvoucher">
                <div className="headvoucher">Customer Voucher</div>

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
                        {customerVoucher?.pdaDetails?.pdaNumber}
                        {customerVoucher?.pdaDetails?.jobId
                          ? ` - ${customerVoucher?.pdaDetails?.jobId}`
                          : ""}
                        <div>
                          {
                            customerVoucher?.pdaDetails?.customerId
                              ?.customerName
                          }
                        </div>
                        <div>
                          {customerVoucher?.pdaDetails?.customerId?.customerAddress
                            ?.split("\n")
                            .map((line, index) => (
                              <div key={index}>{line}</div>
                            ))}
                        </div>
                      </p>
                    </td>
                    <td className="voucherpartfour"></td>
                  </tr>
                  {customerVoucher?.payment?.length > 0 && (
                    <>
                      {customerVoucher?.payment?.map((payment, index) => (
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
                                Mode Of Payment : {payment?.modeofPayment}
                              </div>
                              <div className="voucherprintingnew">
                                {payment?.bank?.bankName}
                              </div>
                            </div>
                          </td>

                          <td className="voucherpartfour text-center">
                            {payment?.currency?.toUpperCase()} {payment?.amount}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  <tr>
                    <td className="voucheraccount">Amount(in words):</td>
                    <td className="voucherpartfour"></td>
                  </tr>
                  <tr>
                    <td className="voucherprinting">
                      {getWordRepresentation(
                        getvoucher?.recvamount,
                        getvoucher?.currency
                      )}{" "}
                    </td>
                    <td className="voucheramountrate text-center">
                      {getvoucher?.currency} {getvoucher?.recvamount}
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

export default ViewCustomerVoucher;
