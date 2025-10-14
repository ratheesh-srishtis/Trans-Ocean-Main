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
import moment from "moment";

import {
  getEmployeeNotifications,
  deleteNotification,
} from "../services/apiService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PopUp from "../pages/PopUp";
const EmployeeNotifications = ({ open, onClose }) => {
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
      const response = await getEmployeeNotifications(payload);
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
            <div>
              {notifications && notifications?.length > 0 && (
                <>
                  {notifications?.length > 0 &&
                    notifications?.map((notification, index) => {
                      return (
                        <>
                          <div>
                            <div>
                              <div>
                                <div
                                  className="notifimessage"
                                  onClick={() => {
                                    viewNotification(notification);
                                  }}
                                >
                                  {notification?.message}
                                </div>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="notifidate">
                                  {moment(notification?.createdAt).format(
                                    "DD-MM-YYYY"
                                  )}
                                </div>
                                <div
                                  onClick={() => {
                                    handleDelete(notification);
                                  }}
                                >
                                  <i className="bi bi-trash-fill notifidots mt-2"></i>
                                </div>
                              </div>
                              <div className="notifiborder"></div>
                            </div>
                          </div>
                        </>
                      );
                    })}
                </>
              )}
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
            </div>
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

export default EmployeeNotifications;
