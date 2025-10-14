import React, { useState, useEffect } from "react";
import "../css/mediasettings.css";
import { uploadCompanyMedia } from "../services/apiService";
import { getCompanyMedias } from "../services/apiService";
import Loader from "../pages/Loader";
import PopUp from "../pages/PopUp";
import { useMedia } from "../context/MediaContext";
const MediaSettings = () => {
  const currentLogo = require("../assets/images/LOGO.png");
  const pdfHeaderImage = require("../assets/images/transocean_new_header.jpg");
  const pdfFooterImage = require("../assets/images/transoceanfooter-1.jpg");
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
  const {
    logoPreview,
    headerPreview,
    footerPreview,
    mediaId,
    getMediaFiles,
    adminDepartmentLogo,
    financeDepartmentLogo,
    operationsDepartmentLogo,
    hrDepartmentLogo,
  } = useMedia();

  // Handlers for each image
  const handleFileChange = async (event, type) => {
    if (event.target.files && event.target.files.length > 0) {
      const formData = new FormData();
      // Append all selected files to FormData
      Array.from(event.target.files).forEach((file) => {
        console.log(file, "file");
        formData.append("file", file); // "files" is the expected key for your API
        formData.append("mediaId", mediaId);
        formData.append("mediaType", type);
      });
      try {
        const response = await uploadCompanyMedia(formData);
        console.log(response, "response_handleLogoChange");
        if (response?.status == true) {
          setMessage("Successfully uploaded image");
          setOpenPopUp(true);
          // after API upload success
          await getMediaFiles(); // 👈 refresh context immediately
        }
      } catch (error) {
        console.error("File upload error:", error);
      }
    }
  };

  return (
    <>
      <div className=" media-settings-container">
        <div className="row ">
          <div className="col-12 text-center fontmedia">Media Settings</div>
        </div>
        {/* Logo Upload Section */}
        <div className="row  mb-4">
          <div className="col-md-4 col-lg-4 col-xl-3 col-12 ">
            <h6 className="subheadmediafont">Logo Upload</h6>
            <div className="media-logo-preview">
              <img
                src={logoPreview}
                alt="Current Logo"
                className="media-logo-img mediathumbnail"
              />
              <label htmlFor="logo-upload" className="media-logo-edit">
                <i className="bi bi-pencil-square"></i>
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => {
                  handleFileChange(event, "logo");
                }}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-4 col-xl-3  col-12 ">
            <h6 className="subheadmediafont">PDF Header Image Upload</h6>
            <div className="media-logo-preview">
              <img
                src={headerPreview}
                alt="PDF Header"
                className="media-logo-img"
              />
              <label htmlFor="header-upload" className="media-logo-edit">
                <i className="bi bi-pencil-square"></i>
              </label>
              <input
                id="header-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => {
                  handleFileChange(event, "pdfHeader");
                }}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-4 col-xl-3 col-12 ">
            <h6 className="subheadmediafont">PDF Footer Image Upload</h6>
            <div className="media-logo-preview">
              <img
                src={footerPreview}
                alt="PDF Footer"
                className="media-logo-img"
              />
              <label htmlFor="footer-upload" className="media-logo-edit">
                <i className="bi bi-pencil-square"></i>
              </label>
              <input
                id="footer-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => {
                  handleFileChange(event, "pdfFooter");
                }}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-4 col-xl-3  col-12 ">
            <h6 className="subheadmediafont">Admin Logo</h6>
            <div className="media-logo-preview">
              <img
                src={adminDepartmentLogo}
                alt="PDF Footer"
                className="media-logo-img"
              />
              <label htmlFor="admin-upload" className="media-logo-edit">
                <i className="bi bi-pencil-square"></i>
              </label>
              <input
                id="admin-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => {
                  handleFileChange(event, "adminDepartmentLogo");
                }}
              />
            </div>
          </div>
        </div>

        <div className="row secand-section-margin">
          <div className="col-md-4 col-lg-4 col-xl-3  col-12 ">
            <h6 className="subheadmediafont">Finance Logo</h6>
            <div className="media-logo-preview">
              <img
                src={financeDepartmentLogo}
                alt="PDF Footer"
                className="media-logo-img"
              />
              <label htmlFor="finance-upload" className="media-logo-edit">
                <i className="bi bi-pencil-square"></i>
              </label>
              <input
                id="finance-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => {
                  handleFileChange(event, "financeDepartmentLogo");
                }}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-4 col-xl-3  col-12">
            <h6 className="subheadmediafont">Operation Logo</h6>
            <div className="media-logo-preview">
              <img
                src={operationsDepartmentLogo}
                alt="PDF Footer"
                className="media-logo-img"
              />
              <label htmlFor="ops-upload" className="media-logo-edit">
                <i className="bi bi-pencil-square"></i>
              </label>
              <input
                id="ops-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => {
                  handleFileChange(event, "operationsDepartmentLogo");
                }}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-4 col-xl-3 col-12 ">
            <h6 className="subheadmediafont">HR Logo</h6>
            <div className="media-logo-preview">
              <img
                src={hrDepartmentLogo}
                alt="PDF Footer"
                className="media-logo-img"
              />
              <label htmlFor="hr-upload" className="media-logo-edit">
                <i className="bi bi-pencil-square"></i>
              </label>
              <input
                id="hr-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => {
                  handleFileChange(event, "hrDepartmentLogo");
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Loader isLoading={isLoading} />
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
    </>
  );
};

export default MediaSettings;
