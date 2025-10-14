// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import {
  saveQQFormQuestion,
  editQQFormQuestion,
} from "../services/apiSettings";
import PopUp from "../pages/PopUp";
import "../css/settings.css";
const AddQQform = ({
  open,
  onAddQQ,
  onClose,
  editMode,
  QQSet,
  errors,
  setErrors,
}) => {
  const [formData, setFormData] = useState({
    question: "",
  });

  const [message, setMessage] = useState("");
  const [openPopUp, setOpenPopUp] = useState(false);
  useEffect(() => {
    if (editMode && QQSet) {
      setFormData({
        question: QQSet.question ? QQSet.question : "",
        questionId: QQSet._id,
      });
    } else {
      setFormData({
        question: "",
      });
    }
  }, [editMode, QQSet]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setFormData({
        question: "",
      });
    }
  }, [open, setErrors]);

  const fetchQQList = async () => {
    setOpenPopUp(false);
    onAddQQ();
    onClose();
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
    if (!formData.question) newErrors.question = "Question is required";
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
        response = await editQQFormQuestion(formData);
      } else {
        // Add new role
        console.log("Add mode formData:", formData);
        response = await saveQQFormQuestion(formData);
      }

      if (response.status === true) {
        setMessage(response.message);
        setOpenPopUp(true);
      }

      setFormData({ question: "" });
      onAddQQ(formData);
      onClose();
    } catch (error) {
      setMessage("API Failed");
      setOpenPopUp(true);
      console.error("Error saving/updating QQForm", error);
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
        <div className="d-flex justify-content-between" onClick={onClose}>
          <DialogTitle>
            {editMode ? "Edit QQForm Question" : "Add QQ Form Question"}
          </DialogTitle>
          <div className="closeicon">
            <i className="bi bi-x-lg "></i>
          </div>
        </div>
        <DialogContent style={{ marginBottom: "60px" }}>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-12 mb-3 align-items-start">
                <div className="">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="form-label"
                  >
                    {" "}
                    Question <span className="required"> * </span>:
                  </label>
                  <textarea
                    name="question"
                    type=""
                    className="form-control qqformaddquestion"
                    id="exampleFormControlInput1"
                    placeholder=""
                    onChange={handleChange}
                    value={formData.question}
                    rows="3"
                    cols="35"
                  ></textarea>
                  {errors.question && (
                    <span className="invalid">{errors.question}</span>
                  )}
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
      {openPopUp && <PopUp message={message} closePopup={fetchQQList} />}
    </>
  );
};

export default AddQQform;
