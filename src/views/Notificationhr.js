// ResponsiveDialog.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import "../css/notifications.css";
import { getHrNotifications, deleteNotification } from "../services/apiService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PopUp from "../pages/PopUp";
const Notificationhr = ({ open, onClose }) => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState("");
  const [totalNotifications, setTotalNotifications] = useState("");
  const [unreadCount, setUnreadCount] = useState("");
  const { logout, loginResponse } = useAuth();

  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  const getNotificationsList = async (limit, offset) => {
    // alert("getNotificationsList");
    let payload = {
      userId: loginResponse?.data?._id,
      limit: limit,
      offset: offset,
    };
    try {
      const response = await getHrNotifications(payload);
      setNotifications(response?.notifications);
      setUnreadCount(response?.unreadCount);
      setTotalNotifications(response?.totalNotifications);
      console.log("getNotificationsList", response);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  const viewMore = async () => {
    console.log(notifications?.length, "notifications?.length viewMore");
    console.log(totalNotifications, "totalNotifications viewMore");
    // if (notifications?.length >= totalNotifications) return;
    getNotificationsList(5, offset + limit);
    setOffset(offset + limit);
  };
  const viewAll = async () => {
    getNotificationsList(0, 0);
  };

  useEffect(() => {
    console.log(open, "opePage");
    if (open == true) {
      getNotificationsList(5, 0);
    }
  }, [open]);

  useEffect(() => {
    console.log(notifications, "notifications");
  }, [notifications]);

  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async (notification) => {
    console.log(notification, "notification");
    let payload = {
      notificationId: notification?._id,
    };
    setIsLoading(true);
    try {
      const response = await deleteNotification(payload);
      if (response.status) {
        setIsLoading(false);
        setMessage("Notification has been deleted successfully");
        setOpenPopUp(true);
        getNotificationsList(5, 0);
      } else {
        setIsLoading(false);
        setMessage("Failed please try again!");
        setOpenPopUp(true);
        getNotificationsList(5, 0);
      }
    } catch (error) {
      setIsLoading(false);

      setMessage("Failed please try again!");
      setOpenPopUp(true);
      getNotificationsList(5, 0);
    }
  };

  const viewNotification = async (notification) => {
    console.log(notification, "notification");
    let row = notification?.pdaId;
    console.log(row, "notification_row");
    if (loginResponse?.data?.userRole?.roleType == "finance") {
      navigate("/create-pda", { state: { row } });
      onClose();
    } else if (loginResponse?.data?.userRole?.roleType == "operations") {
      navigate("/edit-operation", { state: { row } });
      onClose();
    } else if (loginResponse?.data?.userRole?.roleType == "admin") {
      navigate("/create-pda", { state: { row } });
      onClose();
    }
  };
  return (
    <>
      <div>
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
            <DialogTitle>Notifications</DialogTitle>
            <div className="closeicon">
              <i className="bi bi-x-lg "></i>
            </div>
          </div>
          <DialogContent style={{ marginBottom: "40px" }}>
            <div className="">
              <table className="table ">
                <thead className="">
                  <tr className="createtable">
                    <th className="">Employee Name</th>
                    <th className="">Document Type</th>
                    <th className="">Expiry Date</th>
                    <th className="">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notification) => (
                    <tr key={notification._id}>
                      <td>
                        {notification.employeeId?.employeeName
                          ? `${notification.employeeId.employeeName} ${notification.employeeId.employeeLastName}`
                          : "General Documents"}
                      </td>

                      <td>{notification.documentType}</td>
                      <td className="expirydate">
                        {new Date(
                          notification.documentExpireyDate
                        ).toLocaleDateString("en-GB")}
                      </td>
                      <td>
                        <i
                          className="bi bi-trash-fill notifidotshr mt-2"
                          onClick={() => handleDelete(notification)}
                          style={{ cursor: "pointer" }}
                        ></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {notifications?.length >= 5 && (
              <>
                {notifications?.length > 0 && (
                  <>
                    <div
                      className="viewmorenotifi"
                      onClick={() => {
                        viewMore();
                      }}
                    >
                      View More
                    </div>
                  </>
                )}
              </>
            )}
            {notifications?.length > 0 && (
              <>
                <div
                  className="vewall"
                  onClick={() => {
                    viewAll();
                  }}
                >
                  View ALL
                </div>
              </>
            )}
            {notifications?.length == 0 && (
              <>
                <p>No notifications are available at this time</p>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Notificationhr;
