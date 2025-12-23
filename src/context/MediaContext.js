import React, { createContext, useContext, useEffect, useState } from "react";
import { getCompanyMedias } from "../services/apiService";
// Create Context
const MediaContext = createContext();

// Provider Component
export const MediaProvider = ({ children }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
  const [footerPreview, setFooterPreview] = useState(null);
  const [mediaId, setMediaId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminDepartmentLogo, setAdminDepartmentLogo] = useState(null);
  const [financeDepartmentLogo, setFinanceDepartmentLogo] = useState(null);
  const [operationsDepartmentLogo, setOperationsDepartmentLogo] =
    useState(null);
  const [hrDepartmentLogo, setHrDepartmentLogo] = useState(null);

  const getMediaFiles = async () => {
    setIsLoading(true);
    try {
      const response = await getCompanyMedias();
      const media = response?.media[0];

      if (media) {
        setMediaId(media._id);
        setLogoPreview(`${process.env.REACT_APP_ASSET_URL}${media.siteLogo}`);
        localStorage.setItem(
          "logoPreview",
          `${process.env.REACT_APP_ASSET_URL}${media.siteLogo}`
        );
        setHeaderPreview(
          `${process.env.REACT_APP_ASSET_URL}${media.pdfHeader}`
        );
        setFooterPreview(
          `${process.env.REACT_APP_ASSET_URL}${media.pdfFooter}`
        );
        setAdminDepartmentLogo(
          `${process.env.REACT_APP_ASSET_URL}${media.adminDepartmentLogo}`
        );
        setFinanceDepartmentLogo(
          `${process.env.REACT_APP_ASSET_URL}${media.financeDepartmentLogo}`
        );
        setOperationsDepartmentLogo(
          `${process.env.REACT_APP_ASSET_URL}${media.operationsDepartmentLogo}`
        );
        setHrDepartmentLogo(
          `${process.env.REACT_APP_ASSET_URL}${media.hrDepartmentLogo}`
        );
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch media files:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // alert("✅ MediaProvider mounted");
    getMediaFiles();
  }, []);

  return (
    <MediaContext.Provider
      value={{
        logoPreview,
        headerPreview,
        footerPreview,
        mediaId,
        isLoading,
        getMediaFiles,
        adminDepartmentLogo,
        financeDepartmentLogo,
        operationsDepartmentLogo,
        hrDepartmentLogo,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

// Custom hook for easier usage
export const useMedia = () => {
  return useContext(MediaContext);
};
