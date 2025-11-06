import React, { useEffect, useState, useRef } from "react";
import "flatpickr/dist/themes/material_green.css";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom";
import "../css/viewquotation.css";
import ChargesTable from "./ChargesTable";
import { getPdaDetails, getAnchorageLocations } from "../services/apiService";
import Loader from "./Loader";
import moment from "moment";
import ViewOpsChargesTable from "./Operations/ViewOpsChargesTable";
const ViewQuotation = ({
  vessels,
  ports,
  cargos,
  vesselTypes,
  services,
  customers,
  loginResponse,
  vendors,
}) => {
  const Group = require("../assets/images/viewquo.png");

  const location = useLocation();

  const row = location.state?.row; // Access the passed row object
  const [editData, setEditData] = useState(null);
  const [fetchInitiated, setFetchInitiated] = useState(false); // State to track fetch initiation
  const [finalChargesArray, setFinalChargesArray] = useState([]);
  const [pdavalues, setPdavalues] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [opsValue, setOpsValue] = useState(""); // Loader state
  const [invoiceByValue, setInvoiceByValue] = useState(""); // Loader state

  console.log("Row data:", row);

  // Initialize `editData` when `row` is available
  useEffect(() => {
    if (row) {
      setEditData(row);
    }
  }, [row]);

  // Fetch data only once when `editData` changes
  useEffect(() => {
    console.log(editData, "editData");
    if (editData && !fetchInitiated) {
      setFetchInitiated(true); // Mark fetch as initiated
      fetchPdaDetails(editData?._id);
    }
  }, [editData, fetchInitiated]);

  const fetchPdaDetails = async (id) => {
    // alert("fetchPdaDetails");
    setIsLoading(true);
    let data = {
      pdaId: id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      fetchAnchorageValues(pdaDetails?.pda?.portId);
      console.log(pdaDetails, "pdaDetails");
      setOpsValue(pdaDetails?.opsBy);
      setInvoiceByValue(pdaDetails?.invoiceBy);
      updateValues(pdaDetails);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    }
  };

  const updateValues = (response) => {
    console.log(response?.pda?.pda, "updateValues");
    setPdavalues(response?.pda);
    setFinalChargesArray(response?.pdaServices);
  };

  useEffect(() => {
    console.log(pdavalues, "pdavalues");
    console.log(opsValue, "opsValue");
    console.log(customers, "customers");
  }, [pdavalues, opsValue, customers]);

  const getItemName = (id, name) => {
    console.log(id, "id_getItemName");

    if (name === "customer") {
      const customer = customers?.find((s) => s._id === id);
      console.log(customer, "customer_getItemName");
      return customer ? customer.customerName : "N/A";
    } else if (name == "vesselType" && id) {
      const vesselType = vesselTypes.find((s) => s._id === id);
      return vesselType ? vesselType.vesselType : "N/A";
    } else if (name == "customerAddress" && id) {
      const customer = customers?.find((s) => s._id === id);
      console.log(customer, "customer_getItemName");
      return customer ? customer.customerAddress : "N/A";
    }
  };

  const [anchorageLocations, setAnchorageLocations] = useState([]);
  const [anchorageLocation, setAnchorageLocation] = useState([]);

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
    console.log(vesselTypes, "vesselTypes");
    console.log(anchorageLocations, "anchorageLocations");
  }, [vesselTypes, anchorageLocations]);

  useEffect(() => {
    let selected_anchorage_location;
    if (pdavalues?.anchorageLocation) {
      let anchorage_locations_list = localStorage.getItem(
        "anchorage_locations_list"
      );
      console.log(
        JSON.parse(anchorage_locations_list),
        "anchorage_locations_list"
      );
      console.log(
        pdavalues?.anchorageLocation,
        "pdavalues?.anchorageLocation anchorage_locations_list"
      );
      console.log(anchorageLocations, "anchorageLocationsResponse");
      selected_anchorage_location = JSON.parse(anchorage_locations_list).find(
        (location) => location._id === pdavalues?.anchorageLocation
      );
      console.log(selected_anchorage_location, "selected_anchorage_location");
      setAnchorageLocation(selected_anchorage_location?.area);
    }
  }, [pdavalues, anchorageLocations]);

  const getTypeOfCall = () => {
    const types = [];
    if (pdavalues?.isVessels) types.push("Vessels");
    if (pdavalues?.isServices) types.push("Services");
    return types.join(", ") || "N/A"; // Default to "N/A" if none are true
  };

  return (
    <>
      <div className="pda-no">
        <div className=" pdarow ">
          <div className="pdanumber ">
            <span> PDA No : </span>
            <span className="fw-bolder pdafontweight">
              {pdavalues?.pdaNumber}
            </span>
          </div>
          <div className="d-flex justify-content-start back">
            <div className="pdadate">
              <label
                htmlFor="inputPassword"
                className="col-sm-4  col-form-label text-nowrap"
              >
                PDA Date :
              </label>
              <div className="col-sm-4">
                <div className="fw-bolder pdafontweight pda-date">
                  {new Date(pdavalues?.createdAt).toLocaleDateString("en-GB")}
                </div>
              </div>
            </div>
          </div>
          {/* <div className="draft-pda ">
          <span className="badge statusbadge ">
            <i className="bi bi-book-fill book"></i></span>
          <div className="pdabadge">Draft PDA</div>
        </div> */}
        </div>
        <div className="charge">
          <div className="rectangle"></div>
          <div>
            <img src={Group}></img>
          </div>
        </div>
        <div className="row viewquocontent">
          <div className=" col-4 viewhead">
            <span> Vessel Name : </span>{" "}
            <span className="viewans">{editData?.vesselId?.vesselName}</span>
          </div>
          <div className=" col-4 viewhead">
            <span> Port Name : </span>{" "}
            <span className="viewans">{editData?.portId?.portName}</span>
          </div>
          <div className=" col-4 viewhead">
            <span> Cargo : </span>{" "}
            <span className="viewans">
              {" "}
              {editData?.cargoId?.cargoName
                ? editData.cargoId.cargoName
                : "N/A"}
            </span>
          </div>
        </div>
        <div className="row viewquocontent">
          <div className=" col-4 viewhead">
            <span> IMO No : </span>{" "}
            <span className="viewans"> {editData?.IMONumber}</span>
          </div>
          <div className=" col-4 viewhead">
            <span> LOA : </span>{" "}
            <span className="viewans"> {editData?.LOA}</span>
          </div>
          <div className=" col-4 viewhead">
            <span> GRT : </span>{" "}
            <span className="viewans"> {editData?.GRT}</span>
          </div>
        </div>
        <div className="row viewquocontent">
          <div className=" col-4 viewhead">
            <span> NRT : </span>{" "}
            <span className="viewans"> {editData?.NRT}</span>
          </div>
          <div className=" col-4 viewhead">
            <span> ETA : </span>{" "}
            <span className="viewans">
              {moment.utc(editData?.ETA).format("DD-MM-YYYY HH:mm A")}
            </span>
          </div>
          <div className=" col-4 viewhead">
            <span> ETD : </span>
            <span className="viewans">
              {moment.utc(editData?.ETD).format("DD-MM-YYYY HH:mm A")}
            </span>
          </div>
        </div>

        <div className="row viewquocontent">
          <div className=" col-4 viewhead">
            <span> Type of Vessel : </span>{" "}
            <span className="viewans">
              {getItemName(editData?.vesselTypeId, "vesselType") || "N/A"}
            </span>
          </div>

          <div className="col-4 viewhead">
            <span>Type of Call : </span>{" "}
            <span className="viewans">{getTypeOfCall()}</span>
          </div>

          <div className=" col-4 viewhead">
            <span> Vessel Voyage No : </span>
            <span className="viewans">
              {editData?.vesselVoyageNumber
                ? editData?.vesselVoyageNumber
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="row viewquocontent">
          <div className=" col-4 viewhead">
            <span> Anchorage Location : </span>{" "}
            <span className="viewans">
              {" "}
              {anchorageLocation ? anchorageLocation : "N/A"}{" "}
            </span>
          </div>

          {/* <div className=" col-4 viewhead">
            <span> Berth : </span>{" "}
            <span className="viewans">
              {editData?.berth ? editData?.berth : "N/A"}
            </span>
          </div> */}

          <div className=" col-4 viewhead">
            <span> Cargo Capacity : </span>
            <span className="viewans">
              {editData?.cargoCapacity ? editData?.cargoCapacity : "N/A"}
            </span>
          </div>
            <div className=" col-4 viewhead">
            <span> Ops By : </span>
            <span className="viewans">{opsValue ? opsValue : "N/A"}</span>
          </div>
        </div>

        <div className="row viewquocontent">
        
          <div className=" col-4 viewhead">
            <span> Invoice By : </span>
            <span className="viewans">
              {invoiceByValue ? invoiceByValue : "N/A"}
            </span>
          </div>

          <div className=" col-4 viewhead">
            <span> Customer Name : </span>{" "}
            <span className="viewans">
              {getItemName(editData?.customerId?._id, "customer") || "N/A"}
            </span>
          </div>
          <div className="col-4 viewhead">
            <div>
              <span>Customer Address : </span>
            </div>
            <div className="viewans">
              {editData?.customerId?._id ? (
                getItemName(editData?.customerId?._id, "customerAddress")
                  ?.split("\n")
                  .map((line, index) => <div key={index}>{line}</div>)
              ) : (
                <div>N/A</div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="charges-table">
        <div className="row mt-4">
          <div className="col-lg-12">
            {/* <ChargesTable
              chargesArray={finalChargesArray}
              services={services}
              customers={customers}
              ports={ports}
              from={"view-quotation"}
              vendors={vendors}
            /> */}
            <ViewOpsChargesTable
              chargesArray={finalChargesArray}
              services={services}
              customers={customers}
              ports={ports}
              isAction={false}
              from={"view-operation"}
              vendors={vendors}
            />
          </div>
        </div>
      </div>
      <Loader isLoading={isLoading} />
    </>
  );
};

export default ViewQuotation;
