import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { saveSale, editSale } from "../../../services/apiSubPayments";
import { getAssets } from "../../../services/apiSubPayments";
import PopUp from "../../PopUp";
import Loader from "../../Loader";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddSales = ({
  open,
  onClose,
  editMode,
  errors,
  setErrors,
  userSet,
  initialData, // pass existing data for edit
}) => {
  // State for form fields
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  const [assetsList, setAssetsList] = useState([]);

  const [formData, setFormData] = useState({
    assetId: "",
    assetAmount: 0,
    saleAmount: 0,
    saleDate: "",
  });

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await getAssets();
      console.log("getAssets:", response?.assets);
      setAssetsList(response?.assets);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch users", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);
  const toNumberOrZero = (val) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : 0;
  };
  useEffect(() => {
    console.log(userSet, "userSet_appr");
    if (editMode && userSet) {
      setFormData({
        assetId: userSet.assetId?._id || "",
        assetAmount: toNumberOrZero(userSet.assetAmount),
        saleAmount: toNumberOrZero(userSet.saleAmount),

        // convert "21-01-2026" → Date object
        // saleDate: userSet.saleDate
        //   ? moment(userSet.saleDate, "DD-MM-YYYY").toDate()
        //   : null,
        saleDate: userSet.saleDate
          ? moment(userSet.saleDate, ["DD-MM-YYYY", moment.ISO_8601]).format(
              "YYYY-MM-DD"
            )
          : "",
      });
    } else {
      setFormData({
        assetId: "",
        assetAmount: 0,
        saleAmount: 0,
        saleDate: "",
      });
    }
  }, [editMode, userSet]);
  useEffect(() => {
    console.log(formData, "formData_appr");
  }, [formData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors
    // ✅ Clear ONLY the changed field's error
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.assetId) newErrors.assetId = "Asset is required";
    if (!formData.assetAmount)
      newErrors.assetAmount = "Asset Amount is required";
    if (!formData.saleAmount) newErrors.saleAmount = "Sale Amount is required";
    if (!formData.saleDate) newErrors.saleDate = "Sale Date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    console.log("errors", errors);
  }, [errors]);

  // Save handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    // You can add validation here if needed
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      let response;
      if (editMode) {
        console.log("Edit mode formData:", formData);

        const payload = {
          ...formData,
          saleId: userSet?._id,
          saleDate: formData.saleDate
            ? moment(formData.saleDate).format("YYYY-MM-DD")
            : "",
        };

        response = await editSale(payload);
        setIsLoading(false);
      } else {
        console.log("Add mode formData:", formData);

        const payload = {
          ...formData,
          saleDate: formData.saleDate
            ? moment(formData.saleDate).format("YYYY-MM-DD")
            : "",
        };

        response = await saveSale(payload);
        setIsLoading(false);
      }

      if (response.status === true) {
        if (editMode) {
          setMessage("Sale Updated Successfully");
        } else {
          setMessage("Sale Saved Successfully");
        }

        setOpenPopUp(true);
        setFormData({
          assetId: "",
          assetAmount: 0,
          saleAmount: 0,
          saleDate: "",
        });
        onClose();
        setIsLoading(false);
      } else {
        setMessage(response.message);
        setOpenPopUp(true);
        setIsLoading(false);
      }
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving sale", error);
      setIsLoading(false);
    }

    console.log("Payload:", formData);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason === "backdropClick") {
            // Prevent dialog from closing when clicking outside
            return;
          }
          onClose(); // Allow dialog to close for other reasons
        }}
        fullWidth
        maxWidth="sm"
      >
        <div className="d-flex justify-content-between">
          <DialogTitle>{editMode ? "Edit Sale" : "Add Sale"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg" onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">
                  Asset <span className="required">*</span>:
                </label>
                <select
                  name="assetId"
                  className="form-select vesselbox"
                  aria-label="Default select example"
                  onChange={handleChange}
                  value={formData.assetId}
                >
                  <option value="">Choose Asset</option>
                  {assetsList.map((asset) => (
                    <option key={asset?._id} value={asset?._id}>
                      {asset?.asset}
                    </option>
                  ))}
                </select>
                {errors.assetId && (
                  <span className="invalid">{errors.assetId}</span>
                )}
              </div>
              <div className="col mb-3">
                <label className="form-label">
                  Asset Amount <span className="required">*</span>:
                </label>
                <input
                  name="assetAmount"
                  type="number"
                  className="form-control custom-input-styles"
                  value={formData.assetAmount}
                  onChange={handleChange}
                />
                {errors.assetAmount && (
                  <span className="invalid">{errors.assetAmount}</span>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">
                  Sale Amount <span className="required">*</span>:
                </label>
                <input
                  name="saleAmount"
                  type="number"
                  className="form-control custom-input-styles"
                  value={formData.saleAmount}
                  onChange={handleChange}
                />
                {errors.saleAmount && (
                  <span className="invalid">{errors.saleAmount}</span>
                )}
              </div>
              <div className="col mb-3">
                {/* <label className="form-label">
                  Sale Date <span className="required">*</span>:
                </label>
                <DatePicker
                  selected={formData.saleDate}
                  onChange={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      saleDate: date,
                    }))
                  }
                  dateFormat="dd-MM-yyyy"
                  className="form-control custom-picker-styles"
                  placeholderText="DD-MM-YYYY"
                  popperPlacement="bottom-start"
                  popperContainer={({ children }) => (
                    <div style={{ zIndex: 9999 }}>{children}</div>
                  )}
                  portalId="root"
                />
                {errors.saleDate && (
                  <span className="invalid">{errors.saleDate}</span>
                )} */}
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    Payment Date <span className="required"> * </span> :
                  </label>
                  <div className="vessel-select">
                    <input
                      name="saleDate"
                      type="date"
                      className="form-control custom-picker-styles"
                      id="saleDate"
                      placeholder=""
                      onChange={handleChange}
                      value={formData.saleDate}
                    ></input>
                    {errors.saleDate && (
                      <span className="invalid">{errors.saleDate}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="btnuser">
              <button className="btn btna submit-button btnfsize" type="submit">
                Submit
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Loader isLoading={isLoading} />

      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}
    </>
  );
};

export default AddSales;
