// ResponsiveDialog.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import moment from "moment";
import PopUp from "../pages/PopUp";
import "../css/notifications.css";
import { useAuth } from "../context/AuthContext";
import {
  getUserNotifications,
  deleteNotification,
  getUnreadNotificationCount,
} from "../services/apiService";
import { useNavigate } from "react-router-dom";
import Loader from "../pages/Loader";
const NotificationPage = ({ open, onClose, onOpen }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const [message, setMessage] = useState("");
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
    setIsLoading(true);
    try {
      const response = await getUserNotifications(payload);
      setNotifications(response?.notifications);
      setUnreadCount(response?.unreadCount);
      setTotalNotifications(response?.totalNotifications);
      setIsLoading(false);
      console.log("getNotificationsList", response);
      const notificationsUnreadCount = response?.unreadCount;
      return notificationsUnreadCount;
    } catch (error) {
      setIsLoading(false);
      console.error("Failed to fetch quotations:", error);
    }
  };

  const viewAll = async () => {
    getNotificationsList(0, 0);
  };

  const getNotificationCount = async (id) => {
    let payload = {
      userId: loginResponse?.data?._id,
    };
    try {
      const response = await getUnreadNotificationCount(payload);
      // setNotificationCount(response?.unreadCount);
      console.log("getNotificationCount", response);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  // useEffect(() => {
  //   console.log(open, "opePage");
  //   if (open == true) {
  //     getNotificationsList(5, 0);
  //     getNotificationCount();
  //     onOpen("opened", unreadCount); // Notify parent when dialog opens
  //   }
  // }, [open]);

  useEffect(() => {
    console.log(open, "opePage");
    if (open === true) {
      const fetchData = async () => {
        // await getNotificationsList(5, 0); // Fetch notifications list
        const unreadCount = await getNotificationsList(5, 0); // Get the unread count
        onOpen("opened", unreadCount); // Notify parent with the updated count
      };
      fetchData();
    }
  }, [open]);

  const viewMore = async () => {
    console.log(notifications?.length, "notifications?.length viewMore");
    console.log(totalNotifications, "totalNotifications viewMore");
    // if (notifications?.length >= totalNotifications) return;
    // getNotificationsList(5, offset + limit);

    const unreadCount = await getNotificationsList(5, offset + limit); // Get the unread count
    onOpen("opened", unreadCount); // Notify parent with the updated count

    setOffset(offset + limit);
  };

  useEffect(() => {
    getNotificationCount();
  }, []);

  useEffect(() => {
    console.log(notifications, "notifications");
  }, [notifications]);

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
      {openPopUp && (
        <PopUp message={message} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
      <Loader isLoading={isLoading} />
    </>
  );
};

export default NotificationPage;
