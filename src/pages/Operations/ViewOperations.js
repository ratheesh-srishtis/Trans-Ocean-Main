import React, { useEffect, useState, useRef } from "react";
import "flatpickr/dist/themes/material_green.css";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation } from "react-router-dom";
import "../../css/viewquotation.css";
import ChargesTable from "../ChargesTable";
import {
  getPdaDetails,
  getAnchorageLocations,
} from "../../services/apiService";
import Loader from "../Loader";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import ViewOpsChargesTable from "./ViewOpsChargesTable";
import ViewJobForOPS from "./ViewJobForOPS";
const ViewOperations = ({
  vessels,
  ports,
  cargos,
  vesselTypes,
  services,
  customers,
  vendors,
}) => {
  const Group = require("../../assets/images/jobview.png");
  const { loginResponse } = useAuth();

  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const row = location.state?.row; // Access the passed row object
  const [editData, setEditData] = useState(null);
  const [fetchInitiated, setFetchInitiated] = useState(false); // State to track fetch initiation
  const [finalChargesArray, setFinalChargesArray] = useState([]);
  const [pdaValues, setPdaValues] = useState("");
  const [pdavalues, setPdavalues] = useState(null);
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

  const getItemName = (id, name) => {
    if (name === "customer") {
      const customer = customers?.find((s) => s._id === id);
      console.log(customer, "customer");
      return customer ? customer.customerName : "Unknown Customer";
    } else if (name == "cargo") {
      const cargo = cargos?.find((s) => s._id === id);
      return cargo ? cargo.cargoName : "Unknown cargo";
    } else if (name == "vessel") {
      const vessel = vessels?.find((s) => s._id === id);
      return vessel ? vessel.vesselName : "N/A";
    } else if (name == "port") {
      const port = ports?.find((s) => s._id === id);
      return port ? port.portName : "Unknown Port";
    } else if (name == "vesselType" && id) {
      console.log(id, "id_getItemName");
      const vesselType = vesselTypes?.find((s) => s._id === id);
      console.log(vesselType, "vesselType_getItemName");
      return vesselType ? vesselType.vesselType : "Unknown vessel type";
    }
  };

  useEffect(() => {
    console.log(vesselTypes, "vesselTypes");
  }, [vesselTypes]);

  const fetchPdaDetails = async (id) => {
    // alert("fetchPdaDetails");
    setIsLoading(true);

    let data = {
      pdaId: id,
    };
    try {
      const pdaDetails = await getPdaDetails(data);
      updateValues(pdaDetails);
      fetchAnchorageValues(pdaDetails?.pda?.portId);
      setOpsValue(pdaDetails?.opsBy);
      setInvoiceByValue(pdaDetails?.invoiceBy);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    }
  };

  const updateValues = (response) => {
    console.log(response, "updateValues");
    setFinalChargesArray(response?.pdaServices);
    setPdaValues(response?.pda);
  };

  useEffect(() => {
    console.log(pdaValues, "pdaValues");
    console.log(services, "services");
    console.log(cargos, "cargos");
  }, [pdaValues, services, cargos]);

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
      }
    } catch (error) {
      console.error("Error fetching anchorage values:", error);
    }
  };

  // useEffect to update anchorageLocation when pdaValues or anchorageLocations change
  useEffect(() => {
    if (pdaValues?.anchorageLocation && anchorageLocations.length > 0) {
      const selected = anchorageLocations.find(
        (location) => location._id === pdaValues.anchorageLocation
      );
      console.log(selected, "selected_anchorage_location");
      setAnchorageLocation(selected?.area || "");
    }
  }, [pdaValues, anchorageLocations]);

  const getTypeOfCall = () => {
    const types = [];
    if (pdaValues?.isVessels) types.push("Vessels");
    if (pdaValues?.isServices) types.push("Services");
    return types.join(", ") || "N/A"; // Default to "N/A" if none are true
  };

  return (
    <>
      <div className="pda-no">
        <div className=" pdarow ">
          <div className="pdanumber ">
            <span> PDA No: </span>
            <span className="fw-bolder pdafontweight">{pdaValues?.jobId}</span>
          </div>
          <div className="d-flex justify-content-start back">
            <div className="pdadate">
              <label
                htmlFor="inputPassword"
                className="col-sm-4  col-form-label text-nowrap"
              >
                PDA Date:
              </label>
              <div className="col-sm-4">
                <div className="fw-bolder pdafontweight pda-date">
                  {new Date(pdaValues?.createdAt).toLocaleDateString("en-GB")}
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
            <span> Vessel Name: </span>{" "}
            <span className="viewans">
              {getItemName(pdaValues?.vesselId, "vessel")}
            </span>
          </div>
          <div className=" col-4 viewhead">
            <span> Port Name:</span>{" "}
            <span className="viewans">
              {getItemName(pdaValues?.portId, "port")}
            </span>
          </div>
          <div className=" col-4 viewhead">
            <span> Cargo:</span>{" "}
            <span className="viewans">
              {getItemName(pdaValues?.cargoId, "cargo") || "N/A"}
            </span>
          </div>
        </div>
        <div className="row viewquocontent">
          <div className=" col-4 viewhead">
            <span> IMO No:</span>{" "}
            <span className="viewans"> {pdaValues?.IMONumber}</span>
          </div>
          <div className=" col-4 viewhead">
            <span> LOA:</span>{" "}
            <span className="viewans"> {pdaValues?.LOA}</span>
          </div>
          <div className=" col-4 viewhead">
            <span> GRT:</span>{" "}
            <span className="viewans"> {pdaValues?.GRT}</span>
          </div>
        </div>
        <div className="row viewquocontent">
          <div className=" col-4 viewhead">
            <span> NRT:</span>{" "}
            <span className="viewans"> {pdaValues?.NRT}</span>
          </div>
          <div className=" col-4 viewhead">
            <span> ETA:</span>{" "}
            <span className="viewans">
              {moment.utc(pdaValues?.ETA).format("DD-MM-YYYY HH:mm A")}
            </span>
          </div>
          <div className=" col-4 viewhead">
            <span> ETD:</span>{" "}
            <span className="viewans">
              {moment.utc(pdaValues?.ETD).format("DD-MM-YYYY HH:mm A")}
            </span>
          </div>
        </div>
        <div className="row viewquocontent">
          <div className=" col-4 viewhead">
            <span> Type of Vessel:</span>{" "}
            <span className="viewans">
              {" "}
              {getItemName(pdaValues?.vesselTypeId, "vesselType") || "N/A"}
            </span>
          </div>

          <div className="col-4 viewhead">
            <span>Type of Call:</span>{" "}
            <span className="viewans">{getTypeOfCall()}</span>
          </div>

          <div className=" col-4 viewhead">
            <span> Vessel Voyage No: </span>
            <span className="viewans">
              {pdaValues?.vesselVoyageNumber
                ? pdaValues?.vesselVoyageNumber
                : "N/A"}
            </span>
          </div>
        </div>
        <div className="row viewquocontent">
          <div className=" col-4 viewhead">
            <span> Anchorage Location:</span>{" "}
            <span className="viewans">
              {" "}
              {anchorageLocation ? anchorageLocation : "N/A"}{" "}
            </span>
          </div>

          {/* <div className=" col-4 viewhead">
            <span> Berth:</span>{" "}
            <span className="viewans">
              {pdaValues?.berth ? pdaValues?.berth : "N/A"}
            </span>
          </div> */}

          <div className=" col-4 viewhead">
            <span> Cargo Capacity: </span>
            <span className="viewans">
              {pdaValues?.cargoCapacity ? pdaValues?.cargoCapacity : "N/A"}
            </span>
          </div>

          <div className=" col-4 viewhead">
            <span> Customer Name:</span>{" "}
            <span className="viewans">
              {getItemName(pdaValues?.customerId, "customer") || "N/A"}
            </span>
          </div>
        </div>

        <div className="row viewquocontent">
          

          <div className=" col-4 viewhead">
            <span> Ops By:</span>{" "}
            <span className="viewans">{opsValue ? opsValue : "N/A"}</span>
          </div>

          <div className=" col-4 viewhead">
            <span> Invoice By:</span>{" "}
            <span className="viewans">
              {invoiceByValue ? invoiceByValue : "N/A"}
            </span>
          </div>
        </div>
      </div>
      <div className="charges-table">
        <div className="row mt-4">
          <div className="col-lg-12">
            {(loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
              "finance" ||
              loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
                "admin") && (
              <>
                <ViewOpsChargesTable
                  chargesArray={finalChargesArray}
                  services={services}
                  customers={customers}
                  ports={ports}
                  isAction={false}
                  from={"view-operation"}
                  vendors={vendors}
                />
              </>
            )}

            {loginResponse?.data?.userRole?.roleType?.toLowerCase() ==
              "operations" && (
              <>
                <ViewJobForOPS
                  chargesArray={finalChargesArray}
                  services={services}
                  customers={customers}
                  ports={ports}
                  isAction={false}
                  from={"view-operation"}
                  vendors={vendors}
                />
                {/* <ChargesTable
                  chargesArray={finalChargesArray}
                  services={services}
                  customers={customers}
                  ports={ports}
                  isAction={false}
                  from={"view-operation"}
                  vendors={vendors}
                /> */}
              </>
            )}
          </div>
        </div>
      </div>
      <Loader isLoading={isLoading} />
    </>
  );
};

export default ViewOperations;
