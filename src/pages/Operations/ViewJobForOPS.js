import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
  deleteQuotationCharge,
  changeServiceOrder,
} from "../../services/apiService";
import PopUp from "../PopUp";
import { useAuth } from "../../context/AuthContext";
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const ViewJobForOPS = ({
  services,
  ports,
  customers,
  onEdit,
  pdaResponse,
  onSubmit,
  vendors,
  isAction,
  from,
  chargesArray,
}) => {
  const { loginResponse } = useAuth();
  const [charges, setCharges] = useState([]);
  const [subCharges, setSubCharges] = useState([]);
  const [fetchedCharges, setFetchedCharges] = useState(new Set());
  const [fetchedSubCharges, setFetchedSubCharges] = useState(new Set());
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  console.log("from value:", from);
  console.log(vendors, "vendors");
  const totalValues = chargesArray?.reduce(
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
  const vendorTotalValues = chargesArray?.reduce(
    (totals, charge) => {
      totals.quantity += parseInt(charge?.quantity || 0, 10); // Default to 0 if null/undefined
      totals.vendorOMR += parseFloat(charge?.vendorOMR || 0);
      totals.vendorVAT += parseFloat(charge?.vendorVAT || 0);
      totals.vendorTotalUSD += parseFloat(charge?.vendorTotalUSD || 0);
      return totals;
    },
    { quantity: 0, vendorOMR: 0, vendorVAT: 0, vendorTotalUSD: 0 }
  );

  // Format totals after calculations
  const formattedVendorTotals = {
    quantity: vendorTotalValues?.quantity,
    vendorOMR: vendorTotalValues?.vendorOMR.toFixed(3),
    vendorVAT: vendorTotalValues?.vendorVAT.toFixed(3),
    vendorTotalUSD: vendorTotalValues?.vendorTotalUSD.toFixed(2),
  };

  // Function to handle edit action
  const handleEdit = (charge, index) => {
    console.log("Edit:", charge);
    onEdit(charge, index);
    // Implement your edit logic here
  };

  const handleDelete = async (charge, index) => {
    console.log(charge, "charge handleDelete");
    console.log(index, "index handleDelete");
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log("Delete:", charge);
        // Implement your delete logic here (e.g., API call to delete the charge)
        if (charge?._id) {
          try {
            let chargesPayload = {
              pdaChargeId: charge?._id,
            };
            const response = await deleteQuotationCharge(chargesPayload);
            console.log("Fetched Charges:", response);
            const updatedChargesArray = chargesArray.filter(
              (_, i) => i !== index
            );
            onSubmit(updatedChargesArray);
            setMessage("Charge deleted successfully");
            setOpenPopUp(true);
          } catch (error) {
            console.error("Error fetching charges:", error);
            Swal.fire("Error deleting charges");
          }
        } else {
          const updatedChargesArray = chargesArray.filter(
            (_, i) => i !== index
          );
          onSubmit(updatedChargesArray);
          setMessage("Charge deleted successfully");
          setOpenPopUp(true);
        }
      }
    });
  };
  const [valueTabs, setValueTabs] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValueTabs(newValue);
  };

  const handleDragEnd = async (e) => {
    if (!e.destination) return;

    const sourceIndex = e.source.index;
    const destIndex = e.destination.index;

    const tempData = Array.from(chargesArray);
    const [movedItem] = tempData.splice(sourceIndex, 1);
    tempData.splice(destIndex, 0, movedItem);

    // Update the UI
    // setChargesArray(tempData);
    console.log(tempData, "tempData");
    onSubmit(tempData);

    // Call API only for rows whose order has changed
    const changedItems = tempData.filter(
      (item, index) => chargesArray[index]?._id !== item._id
    );

    for (let index = 0; index < changedItems.length; index++) {
      const item = changedItems[index];
      const newIndex = tempData.findIndex((i) => i._id === item._id);

      if (item._id) {
        const payload = {
          pdaChargeId: item._id,
          order: newIndex + 1, // because backend uses 1-based index
        };

        console.log("API_Payload:", payload);

        // Replace with your actual API call
        const response = await changeServiceOrder(payload);
        console.log(response, "changeServiceOrder");
      }
    }
  };

  useEffect(() => {
    console.log(chargesArray, "chargesArray_chargeTable");
  }, [chargesArray]);

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={valueTabs}
            onChange={handleChange}
            aria-label="basic tabs example"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label="Customer Charges"
              {...a11yProps(0)}
              style={{ textTransform: "capitalize" }}
            />
            <Tab
              label="Vendor Charges"
              {...a11yProps(1)}
              style={{ textTransform: "capitalize" }}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={valueTabs} index={0}>
          <div className="createtable">
            <DragDropContext onDragEnd={handleDragEnd}>
              <table className="table tableheadcolor">
                <thead className="tableheadcolor">
                  <tr className="tableheadcolor">
                    {from !== "view-operation" && from !== "view-quotation" && (
                      <>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        />
                      </>
                    )}

                    <th
                      className={
                        loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                        "operations"
                          ? ""
                          : "tableheadcolor"
                      }
                    >
                      Service Type
                    </th>
                    <th
                      className={
                        loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                        "operations"
                          ? ""
                          : "tableheadcolor"
                      }
                    >
                      Charge Type
                    </th>
                    <th
                      className={
                        loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                        "operations"
                          ? ""
                          : "tableheadcolor"
                      }
                    >
                      Sub Charge Type
                    </th>

                    {from !== "view-operation" && (
                      <>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        >
                          Amount (OMR)
                        </th>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        >
                          VAT Amount
                        </th>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        >
                          Total OMR
                        </th>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        >
                          Total USD
                        </th>

                        {isAction == true && (
                          <>
                            <th
                              className={
                                loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                                "operations"
                                  ? ""
                                  : "tableheadcolor"
                              }
                            >
                              Actions
                            </th>{" "}
                          </>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <Droppable droppableId="droppable-1">
                  {(provider) => (
                    <tbody
                      className="text-capitalize"
                      ref={provider.innerRef}
                      {...provider.droppableProps}
                    >
                      {chargesArray?.map((charge, index) => (
                        <Draggable
                          key={charge?._id ? charge?._id : charge?.uniqueId}
                          draggableId={
                            charge?._id ? charge?._id : charge?.uniqueId
                          }
                          index={index}
                        >
                          {(provider) => (
                            <tr
                              {...provider.draggableProps}
                              ref={provider.innerRef}
                            >
                              {from !== "view-operation" &&
                                from !== "view-quotation" && (
                                  <>
                                    <td {...provider.dragHandleProps}>=</td>
                                  </>
                                )}

                              <td>
                                {charge?.serviceId?.serviceName
                                  ? charge?.serviceId?.serviceName
                                  : charge?.serviceName}
                              </td>
                              <td>
                                {charge.chargeId?.chargeName
                                  ? charge.chargeId?.chargeName
                                  : charge.chargeName}
                              </td>
                              <td>
                                {charge.subchargeId?.subchargeName
                                  ? charge.subchargeId?.subchargeName
                                  : charge?.subchargeName}
                              </td>
                              {from !== "view-operation" && (
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

                                  {isAction == true && (
                                    <>
                                      <td>
                                        {/* Edit and Delete Buttons */}

                                        <i
                                          className="bi bi-pencil-square editicon"
                                          onClick={() =>
                                            handleEdit(charge, index)
                                          }
                                        >
                                          {" "}
                                        </i>
                                        {pdaResponse?.pdaStatus != 7 && (
                                          <>
                                            <i
                                              className="bi bi-trash deleteicon"
                                              onClick={() =>
                                                handleDelete(charge, index)
                                              }
                                            ></i>
                                          </>
                                        )}
                                      </td>
                                    </>
                                  )}
                                </>
                              )}
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provider.placeholder}
                    </tbody>
                  )}
                </Droppable>
                {from !== "view-operation" && (
                  <>
                    {chargesArray?.length > 0 && (
                      <>
                        <tfoot>
                          <tr className="bold-row">
                            <td
                              colSpan={
                                from == "view-operation" ||
                                from == "view-quotation"
                                  ? 3
                                  : 4
                              }
                            >
                              Total Cost
                            </td>
                            {/* Use formatted totals */}
                            <td>{formattedTotals.customerOMR}</td>
                            <td>{formattedTotals.customerVAT}</td>
                            <td>
                              {(
                                parseFloat(formattedTotals.customerOMR) +
                                parseFloat(formattedTotals.customerVAT)
                              ).toFixed(3)}
                            </td>
                            <td>{formattedTotals.customerTotalUSD}</td>
                            {isAction == true && (
                              <>
                                <td></td> {/* Empty cell for footer */}
                              </>
                            )}
                          </tr>
                        </tfoot>
                      </>
                    )}
                  </>
                )}
              </table>
            </DragDropContext>
          </div>
        </CustomTabPanel>
        <CustomTabPanel value={valueTabs} index={1}>
          <div className="createtable">
            <DragDropContext onDragEnd={handleDragEnd}>
              <table className="table tableheadcolor">
                <thead className="tableheadcolor">
                  <tr className="tableheadcolor">
                    {from !== "view-operation" && from !== "view-quotation" && (
                      <>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        />
                      </>
                    )}
                    <th
                      className={
                        loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                        "operations"
                          ? ""
                          : "tableheadcolor"
                      }
                    >
                      Service Type
                    </th>
                    <th
                      className={
                        loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                        "operations"
                          ? ""
                          : "tableheadcolor"
                      }
                    >
                      Charge Type
                    </th>
                    <th
                      className={
                        loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                        "operations"
                          ? ""
                          : "tableheadcolor"
                      }
                    >
                      Sub Charge Type
                    </th>
                    <th
                      className={
                        loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                        "operations"
                          ? ""
                          : "tableheadcolor"
                      }
                    >
                      Vendor
                    </th>

                    {from !== "view-operation" && (
                      <>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        >
                          Amount (OMR)
                        </th>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        >
                          VAT Amount
                        </th>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        >
                          Total OMR
                        </th>
                        <th
                          className={
                            loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                            "operations"
                              ? ""
                              : "tableheadcolor"
                          }
                        >
                          Total USD
                        </th>

                        {isAction == true && (
                          <>
                            <th
                              className={
                                loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                                "operations"
                                  ? ""
                                  : "tableheadcolor"
                              }
                            >
                              Actions
                            </th>{" "}
                          </>
                        )}
                      </>
                    )}
                  </tr>
                </thead>
                <Droppable droppableId="droppable-1">
                  {(provider) => (
                    <tbody
                      className="text-capitalize"
                      ref={provider.innerRef}
                      {...provider.droppableProps}
                    >
                      {chargesArray?.map((charge, index) => (
                        <Draggable
                          key={charge?._id ? charge?._id : charge?.uniqueId}
                          draggableId={
                            charge?._id ? charge?._id : charge?.uniqueId
                          }
                          index={index}
                        >
                          {(provider) => (
                            <tr
                              {...provider.draggableProps}
                              ref={provider.innerRef}
                            >
                              {from !== "view-operation" &&
                                from !== "view-quotation" && (
                                  <>
                                    <td {...provider.dragHandleProps}> = </td>
                                  </>
                                )}
                              <td>
                                {charge?.serviceId?.serviceName
                                  ? charge?.serviceId?.serviceName
                                  : charge?.serviceName}
                              </td>
                              <td>
                                {charge.chargeId?.chargeName
                                  ? charge.chargeId?.chargeName
                                  : charge.chargeName}
                              </td>
                              <td>
                                {charge.subchargeId?.subchargeName
                                  ? charge.subchargeId?.subchargeName
                                  : charge?.subchargeName}
                              </td>

                              {/* <td>
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

                                  // Filter out private vendors first
                                  const nonPrivateVendors = vendorFields.filter(
                                    (v) => !v.isPrivate
                                  );

                                  // Check if we have multiple non-private vendors
                                  const hasMultipleVendors =
                                    nonPrivateVendors.length > 1;

                                  return nonPrivateVendors.map((v, idx) => {
                                    const vendorName = vendors?.find(
                                      (vendor) => vendor._id === v.id
                                    )?.vendorName;

                                    const displayName =
                                      vendorName && vendorName.trim()
                                        ? vendorName
                                        : "N/A";

                                    return (
                                      <div key={v.id}>
                                        {hasMultipleVendors
                                          ? `${idx + 1}: `
                                          : ""}
                                        {displayName}
                                      </div>
                                    );
                                  });
                                })()}
                              </td>
                              {/* <td>
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
                              </td> */}

                              {from !== "view-operation" && (
                                <>
                                  <td>
                                    {(() => {
                                      const decimalPlaces = 3;
                                      const vendorIds = [
                                        "vendorId",
                                        "vendor2Id",
                                        "vendor3Id",
                                        "vendor4Id",
                                      ]
                                        .map((key) => charge[key])
                                        .filter((id) => id);
                                      const omrKeys = [
                                        "vendorOMR",
                                        "vendor2OMR",
                                        "vendor3OMR",
                                        "vendor4OMR",
                                      ];
                                      if (vendorIds.length === 0) {
                                        return (
                                          <div>
                                            {(0).toFixed(decimalPlaces)}
                                          </div>
                                        );
                                      }
                                      // Get OMR values for valid vendors
                                      const omrValues = vendorIds.map(
                                        (_, idx) => {
                                          const val = parseFloat(
                                            charge[omrKeys[idx]]
                                          );
                                          return !isNaN(val) ? val : 0;
                                        }
                                      );
                                      // If all OMR values are zero, show 0.00 for each valid vendor
                                      if (omrValues.every((v) => v === 0)) {
                                        return omrValues.map((_, idx) => (
                                          <div key={idx}>
                                            {(0).toFixed(decimalPlaces)}
                                          </div>
                                        ));
                                      }
                                      // Otherwise, show value for each valid vendor
                                      return omrValues.map((num, idx) => (
                                        <div key={idx}>
                                          {num.toFixed(decimalPlaces)}
                                        </div>
                                      ));
                                    })()}
                                  </td>

                                  <td>
                                    {(() => {
                                      const decimalPlaces = 3;
                                      const vendorIds = [
                                        "vendorId",
                                        "vendor2Id",
                                        "vendor3Id",
                                        "vendor4Id",
                                      ]
                                        .map((key) => charge[key])
                                        .filter((id) => id);
                                      const vatKeys = [
                                        "vendorVAT",
                                        "vendor2VAT",
                                        "vendor3VAT",
                                        "vendor4VAT",
                                      ];
                                      if (vendorIds.length === 0) {
                                        return (
                                          <div>
                                            {(0).toFixed(decimalPlaces)}
                                          </div>
                                        );
                                      }
                                      // Get VAT values for valid vendors
                                      const vatValues = vendorIds.map(
                                        (_, idx) => {
                                          const val = parseFloat(
                                            charge[vatKeys[idx]]
                                          );
                                          return !isNaN(val) ? val : 0;
                                        }
                                      );
                                      // If all VAT values are zero, show 0.00 for each valid vendor
                                      if (vatValues.every((v) => v === 0)) {
                                        return vatValues.map((_, idx) => (
                                          <div key={idx}>
                                            {(0).toFixed(decimalPlaces)}
                                          </div>
                                        ));
                                      }
                                      // Otherwise, show value for each valid vendor
                                      return vatValues.map((num, idx) => (
                                        <div key={idx}>
                                          {num.toFixed(decimalPlaces)}
                                        </div>
                                      ));
                                    })()}
                                  </td>
                                  <td>
                                    {(() => {
                                      const decimalPlaces = 3;
                                      const vendorIds = [
                                        "vendorId",
                                        "vendor2Id",
                                        "vendor3Id",
                                        "vendor4Id",
                                      ]
                                        .map((key) => charge[key])
                                        .filter((id) => id);
                                      const omrKeys = [
                                        "vendorOMR",
                                        "vendor2OMR",
                                        "vendor3OMR",
                                        "vendor4OMR",
                                      ];
                                      const vatKeys = [
                                        "vendorVAT",
                                        "vendor2VAT",
                                        "vendor3VAT",
                                        "vendor4VAT",
                                      ];
                                      // For each valid vendor, show total (OMR + VAT), or 0.00 if missing
                                      if (vendorIds.length === 0) {
                                        return (
                                          <div>
                                            {(0).toFixed(decimalPlaces)}
                                          </div>
                                        );
                                      }
                                      return vendorIds.map((_, idx) => {
                                        const omr = parseFloat(
                                          charge[omrKeys[idx]]
                                        );
                                        const vat = parseFloat(
                                          charge[vatKeys[idx]]
                                        );
                                        const sum =
                                          (isNaN(omr) ? 0 : omr) +
                                          (isNaN(vat) ? 0 : vat);
                                        return (
                                          <div key={idx}>
                                            {sum.toFixed(decimalPlaces)}
                                          </div>
                                        );
                                      });
                                      // If less than 4 vendors, fill with 0.00 for missing slots
                                    })()}
                                  </td>

                                  <td>
                                    {(() => {
                                      const decimalPlaces = 3;
                                      const vendorIds = [
                                        "vendorId",
                                        "vendor2Id",
                                        "vendor3Id",
                                        "vendor4Id",
                                      ]
                                        .map((key) => charge[key])
                                        .filter((id) => id);
                                      const usdKeys = [
                                        "vendorTotalUSD",
                                        "vendor2TotalUSD",
                                        "vendor3TotalUSD",
                                        "vendor4TotalUSD",
                                      ];
                                      if (vendorIds.length === 0) {
                                        return (
                                          <div>
                                            {(0).toFixed(decimalPlaces)}
                                          </div>
                                        );
                                      }
                                      // For each valid vendor, show USD value, or 0.00 if missing
                                      return vendorIds.map((_, idx) => {
                                        const val = parseFloat(
                                          charge[usdKeys[idx]]
                                        );
                                        return (
                                          <div key={idx}>
                                            {!isNaN(val) && val !== 0
                                              ? val.toFixed(decimalPlaces)
                                              : (0).toFixed(decimalPlaces)}
                                          </div>
                                        );
                                      });
                                    })()}
                                  </td>

                                  {isAction == true && (
                                    <>
                                      <td>
                                        {/* Edit and Delete Buttons */}

                                        <i
                                          className="bi bi-pencil-square editicon"
                                          onClick={() =>
                                            handleEdit(charge, index)
                                          }
                                        >
                                          {" "}
                                        </i>
                                        {pdaResponse?.pdaStatus != 7 && (
                                          <>
                                            <i
                                              className="bi bi-trash deleteicon"
                                              onClick={() =>
                                                handleDelete(charge, index)
                                              }
                                            ></i>
                                          </>
                                        )}
                                      </td>
                                    </>
                                  )}
                                </>
                              )}
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provider.placeholder}
                    </tbody>
                  )}
                </Droppable>

                {from !== "view-operation" && (
                  <>
                    {chargesArray?.length > 0 && (
                      <>
                        <tfoot>
                          <tr className="bold-row">
                            <td
                              colSpan={
                                from == "view-operation" ||
                                from == "view-quotation"
                                  ? 4
                                  : 5
                              }
                            >
                              Total Cost
                            </td>
                            {/* Vendor OMR Total: sum all vendorOMR, vendor2OMR, vendor3OMR, vendor4OMR for all charges */}
                            <td>
                              {(() => {
                                let totalOMR = 0;
                                chargesArray?.forEach((charge) => {
                                  [
                                    "vendorOMR",
                                    "vendor2OMR",
                                    "vendor3OMR",
                                    "vendor4OMR",
                                  ].forEach((key) => {
                                    const val = parseFloat(charge[key]);
                                    if (!isNaN(val) && val !== 0)
                                      totalOMR += val;
                                  });
                                });
                                return totalOMR.toFixed(3);
                              })()}
                            </td>
                            {/* Vendor VAT Total: sum all vendorVAT, vendor2VAT, vendor3VAT, vendor4VAT for all charges */}
                            <td>
                              {(() => {
                                let totalVAT = 0;
                                chargesArray?.forEach((charge) => {
                                  [
                                    "vendorVAT",
                                    "vendor2VAT",
                                    "vendor3VAT",
                                    "vendor4VAT",
                                  ].forEach((key) => {
                                    const val = parseFloat(charge[key]);
                                    if (!isNaN(val) && val !== 0)
                                      totalVAT += val;
                                  });
                                });
                                return totalVAT.toFixed(3);
                              })()}
                            </td>
                            {/* Vendor Total OMR: sum all (vendorOMR + vendorVAT), (vendor2OMR + vendor2VAT), ... for all charges */}
                            <td>
                              {(() => {
                                let total = 0;
                                chargesArray?.forEach((charge) => {
                                  [0, 1, 2, 3].forEach((idx) => {
                                    const omr = parseFloat(
                                      charge[
                                        [
                                          "vendorOMR",
                                          "vendor2OMR",
                                          "vendor3OMR",
                                          "vendor4OMR",
                                        ][idx]
                                      ]
                                    );
                                    const vat = parseFloat(
                                      charge[
                                        [
                                          "vendorVAT",
                                          "vendor2VAT",
                                          "vendor3VAT",
                                          "vendor4VAT",
                                        ][idx]
                                      ]
                                    );
                                    const sum =
                                      (isNaN(omr) ? 0 : omr) +
                                      (isNaN(vat) ? 0 : vat);
                                    if (sum !== 0) total += sum;
                                  });
                                });
                                return total.toFixed(3);
                              })()}
                            </td>
                            {/* Vendor Total USD: sum all vendorTotalUSD, vendor2TotalUSD, vendor3TotalUSD, vendor4TotalUSD for all charges */}
                            <td>
                              {(() => {
                                let totalUSD = 0;
                                chargesArray?.forEach((charge) => {
                                  [
                                    "vendorTotalUSD",
                                    "vendor2TotalUSD",
                                    "vendor3TotalUSD",
                                    "vendor4TotalUSD",
                                  ].forEach((key) => {
                                    const val = parseFloat(charge[key]);
                                    if (!isNaN(val) && val !== 0)
                                      totalUSD += val;
                                  });
                                });
                                return totalUSD.toFixed(2);
                              })()}
                            </td>
                            {isAction == true && (
                              <>
                                <td></td> {/* Empty cell for footer */}
                              </>
                            )}
                          </tr>
                        </tfoot>
                      </>
                    )}
                  </>
                )}
              </table>
            </DragDropContext>
          </div>
        </CustomTabPanel>
      </Box>

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default ViewJobForOPS;
