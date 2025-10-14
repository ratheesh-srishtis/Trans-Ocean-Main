import React from "react";
import "./Transwave-Templates-css/Mashreq_USD_IBAN_Letter.css";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

const MashreqUSDIBANLetter = ({
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
      <DialogTitle>Mashreq USD IBAN Letter</DialogTitle>
      <DialogContent>
        <div className="mashreq-usd-iban-letter">
          {/* Content for Mashreq USD IBAN Letter goes here */}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MashreqUSDIBANLetter;
