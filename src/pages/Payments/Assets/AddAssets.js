import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { getAllBanks } from "../../../services/apiSettings";
import { saveAsset, editAsset } from "../../../services/apiSubPayments";
import PopUp from "../../PopUp";
import Loader from "../../Loader";
import moment from "moment";

const AddAssets = ({
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
  const [formData, setFormData] = useState({
    asset: "",
  });
  const [BankList, setBankList] = useState([]);

  const fetchBanks = async () => {
    setIsLoading(true);

    try {
      const listbanks = await getAllBanks();
      setBankList(listbanks?.bank || []);
      setIsLoading(false);
    } catch (error) {
      console.log("Bank list Error", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  useEffect(() => {
    if (editMode && userSet && BankList.length) {
      const selectedBank = BankList.find((b) => b.bankName === userSet.bank);
      setFormData({
        asset: userSet.asset || "",
      });
    } else {
      setFormData({
        asset: "",
      });
    }
  }, [editMode, userSet, BankList]);

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
    if (!formData.asset) newErrors.asset = "Asset is required";

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
        formData.assetId = userSet?._id;
        response = await editAsset(formData);
        setIsLoading(false);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveAsset(formData);
        setIsLoading(false);
      }
      if (response.status === true) {
        if (editMode) {
          setMessage("Asset Updated Successfully");
        } else {
          setMessage("Asset Saved Successfully");
        }

        setOpenPopUp(true);
        setFormData({
          asset: "",
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
      console.error("Error saving/updating user", error);
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
          <DialogTitle>{editMode ? "Edit Asset" : "Add Asset"}</DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg" onClick={onClose}></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "40px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col mb-3">
                <label className="form-label">
                  asset <span className="required">*</span>:
                </label>
                <input
                  name="asset"
                  type="text"
                  className="form-control custom-input-styles"
                  value={formData.asset}
                  onChange={handleChange}
                />
                {errors.asset && (
                  <span className="invalid">{errors.asset}</span>
                )}
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

export default AddAssets;
