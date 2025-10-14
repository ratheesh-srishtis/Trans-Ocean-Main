// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  getAllPorts,
  saveAnchorageLoation,
  editAnchorageLoation,
} from "../services/apiSettings";
import "../css/settings.css";
import PopUp from "../pages/PopUp";
import Swal from "sweetalert2";
const AddAnchorageLocation = ({
  open,
  onAddAnchorageLocation,
  onClose,
  editMode,
  anchorageSet,
  portId,
  errors,
  setErrors,
}) => {
  const [PortList, setPortList] = useState([]);
  const [formData, setFormData] = useState({ area: "", portId: "" });
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [closePopUp, setclosePopup] = useState(false);

  const fetchAllPorts = async () => {
    try {
      const listallports = await getAllPorts();
      setPortList(listallports?.ports || []);
    } catch (error) {
      console.error("Failed to fetch ports", error);
    }
  };
  useEffect(() => {
    fetchAllPorts();
  }, []);
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      portId: portId || "",
    }));
  }, [portId]);

  useEffect(() => {
    if (editMode && anchorageSet) {
      setFormData({
        area: anchorageSet.area,
        portId: portId,
        anchorageLocationId: anchorageSet._id,
      });
    } else {
      setFormData({
        area: "",
        portId: "",
      });
    }
  }, [editMode, anchorageSet]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        area: "",
      });
    }
  }, [open, setErrors]);

  const fetchanchorageList = async () => {
    if (closePopUp == false) {
      onAddAnchorageLocation();
      onClose();
    }
    setOpenPopUp(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.area) newErrors.area = "Area is required";
    if (!formData.portId) newErrors.portId = "Port is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      let response;
      if (editMode) {
        console.log("Edit mode formData:", formData);
        response = await editAnchorageLoation(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveAnchorageLoation(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
        setFormData({ area: "", portId: "" });
        onAddAnchorageLocation(formData);
        onClose();
      } else {
        setMessage(response.message);
        setOpenPopUp(true);
        setclosePopup(true);
      }
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating user", error);
    }
  };

  return (
    <>
      <Dialog
        sx={{
          width: 800,
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
          <DialogTitle>
            {editMode ? "Edit Anchorage Location" : "Add Anchorage Location"}
          </DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-3 mb-3 align-items-start">
                <div className=" col-">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Area<span className="required"> * </span>:
                  </label>
                  <input
                    name="area"
                    type=""
                    className="form-control vessel-voyage"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.area}
                  ></input>
                  {errors.area && (
                    <span className="invalid">{errors.area}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col- mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Ports <span className="required"> * </span> :
                  </label>
                  <div className="vessel-select">
                    <select
                      name="portId"
                      className="form-select vesselbox"
                      aria-label="Default select example"
                      onChange={handleChange}
                      value={formData.portId}
                    >
                      <option value="">Choose Ports </option>
                      {PortList.map((ports) => (
                        <option key={ports._id} value={ports._id}>
                          {ports.portName}{" "}
                        </option>
                      ))}
                    </select>
                    {errors.portId && (
                      <span className="invalid">{errors.portId}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="btnuser">
              <button className="btn btna submit-button btnfsize">
                {" "}
                Submit{" "}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {openPopUp && <PopUp message={message} closePopup={fetchanchorageList} />}
    </>
  );
};

export default AddAnchorageLocation;
