import React, { useEffect, useState } from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { getCharges, getSubcharges } from "../../services/apiService";
import PopUp from "../PopUp";
import AddJobs from "./AddJobs";
import "../../css/addjobs.css";
import { useAuth } from "../../context/AuthContext";
const OpsChargesTable = ({
  chargesArray,
  services,
  ports,
  customers,
  onEdit,
  pdaResponse,
  onSubmit,
  templates,
  vendors,
  opsPhoneNumber,
}) => {
  const { loginResponse } = useAuth();

  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCharge, setSelectedCharge] = useState(null); // State to hold the selected charge

  const totalValues = chargesArray?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge.quantity);
      totals.customerOMR += parseFloat(charge.customerOMR);
      totals.customerVAT += parseFloat(charge.customerVAT);
      totals.customerTotalUSD += parseFloat(charge.customerTotalUSD);
      return totals;
    },
    { quantity: 0, customerOMR: 0, customerVAT: 0, customerTotalUSD: 0 }
  );

  console.log(totalValues, "totalValues");

  const vendorTotalValues = chargesArray?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge.quantity);
      totals.vendorOMR += parseFloat(charge.vendorOMR);
      totals.vendorVAT += parseFloat(charge.vendorVAT);
      totals.vendorTotalUSD += parseFloat(charge.vendorTotalUSD);
      return totals;
    },
    { quantity: 0, vendorOMR: 0, vendorVAT: 0, vendorTotalUSD: 0 }
  );

  console.log(vendorTotalValues, "vendorTotalValues");

  const handleRowClick = (charge) => {
    console.log(charge);
  };

  // Function to handle edit action
  const handleEdit = (charge, index) => {
    console.log("Edit:", charge);
    onEdit(charge, index);
    // Implement your edit logic here
  };

  const [valueTabs, setValueTabs] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValueTabs(newValue);
  };

  const [open, setOpen] = useState(false);

  const openDialog = (charge) => {
    setSelectedCharge(charge); // Set the selected charge
    handleClickOpen();
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // setSelectedCharge(null); // Clear the selected charge
    // onSubmit();
  };
  const handleSubmit = () => {
    setOpen(false);
    setSelectedCharge(null); // Clear the selected charge
    onSubmit();
  };

  useEffect(() => {
    console.log(selectedCharge, "selectedCharge");
  }, [selectedCharge]);

  const [isLoading, setIsLoading] = useState(true); // Track loading state

  const getVendorName = (vendorId) => {
    const vendor = vendors.find((v) => v._id === vendorId);
    return vendor?.vendorName || "";
  };

  useEffect(() => {
    console.log(chargesArray, "chargesArray");
  }, [chargesArray]);

  return (
    <>
      <div className="createtable">
        <table className="table tableheadcolor">
          <thead className="tableheadcolor">
            <tr className="tableheadcolor">
              <th className="tableheadcolor">SL NO</th>
              <th className="tableheadcolor">Service Type</th>
              <th className="tableheadcolor">Charge Type</th>
              <th className="tableheadcolor">Sub Charge Type</th>
              <th className="tableheadcolor">Vendor Name</th>
              {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                "operations" && (
                <>
                  <th className="tableheadcolor">Amount (OMR)</th>
                  <th className="tableheadcolor">VAT Amount</th>
                  <th className="tableheadcolor">Total OMR</th>
                  <th className="tableheadcolor">Total USD</th>
                </>
              )}
              {/* <th className="tableheadcolor">Remarks</th> */}
              <th className="tableheadcolor">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chargesArray?.length > 0 &&
              chargesArray.map((charge, index) => (
                <tr key={index} onClick={() => handleRowClick(charge)}>
                  {/* className="addjob-click" */}
                  <td>{index + 1}</td>
                  <td> {charge?.serviceId?.serviceName}</td>
                  <td> {charge.chargeId?.chargeName}</td>
                  <td>{charge.subchargeId?.subchargeName}</td>
                  {/* <td>
                    {(() => {
                      const vendorKeys = [
                        { id: "vendorId", flag: "isPrivateVendor" },
                        { id: "vendor2Id", flag: "isPrivateVendor2" },
                        { id: "vendor3Id", flag: "isPrivateVendor3" },
                        { id: "vendor4Id", flag: "isPrivateVendor4" },
                      ];
                      const visibleVendors = vendorKeys
                        .filter(
                          ({ id, flag }) => charge[id] && charge[flag] === false
                        )
                        .map(({ id }, idx) => {
                          const vendorName = vendors?.find(
                            (v) => v._id === charge[id]
                          )?.vendorName;
                          return (
                            <div key={charge[id]}>
                              {idx + 1}:{" "}
                              {vendorName && vendorName.trim()
                                ? vendorName
                                : ""}
                            </div>
                          );
                        });
                      if (visibleVendors.length === 0) {
                        return <div>N/A</div>;
                      }
                      return visibleVendors;
                    })()}
                  </td> */}
                  <td>
                    {(() => {
                      // Collect valid vendor IDs and their corresponding isPrivateVendor flags
                      const vendorFields = [
                        {
                          id: charge.vendorId,
                          isPrivate: charge.isPrivateVendor,
                        },
                        {
                          id: charge.vendor2Id,
                          isPrivate: charge.isPrivateVendor2,
                        },
                        {
                          id: charge.vendor3Id,
                          isPrivate: charge.isPrivateVendor3,
                        },
                        {
                          id: charge.vendor4Id,
                          isPrivate: charge.isPrivateVendor4,
                        },
                      ].filter((v) => v.id); // Only keep vendors with an ID

                      // Move console.log here
                      console.log(vendorFields, "vendorFields");

                      if (vendorFields.length === 0) {
                        return <div>N/A</div>;
                      }

                      if (
                        vendorFields.length > 0 &&
                        vendorFields.every((v) => v.isPrivate)
                      ) {
                        return <div></div>;
                      }

                      return vendorFields
                        .map((v, idx) => {
                          if (!v.isPrivate) {
                            const vendorName = vendors?.find(
                              (vendor) => vendor._id === v.id
                            )?.vendorName;
                            return (
                              <div key={v.id}>
                                {idx + 1}:{" "}
                                {vendorName && vendorName.trim()
                                  ? vendorName
                                  : ""}
                              </div>
                            );
                          }
                          return null;
                        })
                        .filter(Boolean);
                    })()}
                  </td>
                  {loginResponse?.data?.userRole?.roleType?.toLowerCase() !==
                    "operations" && (
                    <>
                      <td>{charge.customerOMR.toFixed(3)}</td>
                      <td>{charge.customerVAT.toFixed(3)}</td>
                      <td>
                        {(
                          parseFloat(charge.customerOMR) +
                          parseFloat(charge.customerVAT)
                        ).toFixed(3)}
                      </td>
                      <td>{charge.customerTotalUSD.toFixed(2)}</td>
                    </>
                  )}

                  {/* <td className="subsub">{charge.remark}</td> */}

                  <td>
                    <i
                      className="bi bi-pencil-square editicon"
                      onClick={() => {
                        openDialog(charge);
                      }}
                    >
                      {" "}
                    </i>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AddJobs
        open={open}
        onClose={handleClose}
        onSubmit={handleSubmit}
        templates={templates}
        charge={selectedCharge}
        services={services}
        ports={ports}
        customers={customers}
        vendors={vendors}
        pdaResponse={pdaResponse}
        opsPhoneNumber={opsPhoneNumber}
      />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default OpsChargesTable;
