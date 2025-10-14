import React from "react";
import "./Transwave-Templates-css/TWMS_Letterhead_New.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

const TWMSLetterheadNew = ({
  open,
  onClose,
  charge,
  selectedTemplateName,
  selectedTemplate,
  pdaResponse,
}) => {
  const handleClose = (event, reason) => {
    if (reason === "backdropClick") {
      return; // Prevent closing on backdrop click
    }
    onClose(event, reason);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>TWMS Letterhead - New</DialogTitle>
      <DialogContent>
        <div className="twms-letterhead-new">
          {/* Content for TWMS Letterhead - New template goes here */}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TWMSLetterheadNew;
