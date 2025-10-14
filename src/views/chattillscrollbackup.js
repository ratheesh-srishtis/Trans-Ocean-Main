// ResponsiveDialog.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import "../css/chats.css";
import {
  getAllChatMessages,
  getUnreadChatCount,
  saveChatMessage,
  deleteChatMessage,
  editChatMessage,
} from "../services/chatApiService";
import { useAuth } from "../context/AuthContext";
import PopUp from "../pages/PopUp";
const chattillscrollbackup = () => {
  const [chatList, setChatList] = useState([]);
  const [newChatList, setNewChatList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loader state
  const [openPopUp, setOpenPopUp] = useState(false);
  const { logout, loginResponse } = useAuth();
  const Group = require("../assets/images/LOGO.png");
  const chatroom = require("../assets/images/chatroomimage.png");

  const [message, setMessage] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [senderType, setSenderType] = useState(
    loginResponse?.data?.userRole?.roleType
  );
  const [userId, setUserId] = useState(loginResponse?.data?._id);

  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [totalMessages, setTotalMessages] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null); // Track message being edited

  const [unreadCounts, setUnreadCounts] = useState(null);

  const [isFetching, setIsFetching] = useState(false);
  const chatContainerRef = useRef(null);

  const [recieverType, setRecieverType] = useState("admin");

  const [chatUsers, setChatUsers] = useState([
    { type: "admin", message: "Lorem ipsum dolor sit amet....", unread: 0 },
    { type: "finance", message: "Lorem ipsum dolor sit amet....", unread: 0 },
    {
      type: "operations",
      message: "Lorem ipsum dolor sit amet....",
      unread: 0,
    },
    { type: "hr", message: "Lorem ipsum dolor sit amet....", unread: 0 },
  ]);

  const updateUnreadCounts = (apiCounts) => {
    const updatedChatUsers = chatUsers.map((user) => {
      let unreadCount = 0;

      switch (user.type) {
        case "admin":
          unreadCount = apiCounts?.adminChatCount || 0;
          break;
        case "finance":
          unreadCount = apiCounts?.financeChatCount || 0;
          break;
        case "operations":
          unreadCount = apiCounts?.operationsChatCount || 0;
          break;
        case "hr":
          unreadCount = apiCounts?.hrChatCount || 0;
          break;
        default:
          unreadCount = 0;
      }

      return { ...user, unread: unreadCount };
    });

    setChatUsers(updatedChatUsers);
  };

  const handleUserClick = (type) => {
    setNewChatList([]);
    setRecieverType(type);
    console.log("Selected User Type:", type);
    getChatsList(limit, 0, type);
  };

  const getChatsList = async (limit, offset, type) => {
    let payload = {
      userId: userId,
      limit: limit,
      offset: offset,
      group: type,
    };
    try {
      const response = await getAllChatMessages(payload);
      // setChatList(response?.chat);
      setTotalMessages(response?.totalMessages);
      console.log("getAllChatMessages", response);
      // let newMessages = []; // Reverse for latest first
      // newMessages = response?.chat || []; // Reverse for latest first
      let newMessages = response?.chat ? [...response.chat].reverse() : []; // Reverse the new messages
      console.log(newMessages, "newMessages");
      setNewChatList((prevChat) => ({
        ...prevChat,
        newMessages: [...(prevChat?.newMessages || []), ...newMessages], // Append new messages
      }));
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    getChatsList(limit, offset, "admin");
  }, []);

  useEffect(() => {
    console.log(newChatList?.newMessages, "newChatList");
  }, [newChatList]);

  const handleSendMessage = async () => {
    if (!message.trim()) return; // Prevent empty messages

    if (editingMessage) {
      // If editing, call the edit API
      await editMessageAPICall();
    } else {
      // If not editing, send a new message
      let payload = {
        receiver: recieverType,
        sender: senderType,
        message: message,
        senderId: userId,
      };
      try {
        // setHasScrolled(false);
        setIsFetching(true); // Temporarily disable scroll fetching
        const response = await saveChatMessage(payload);
        console.log("Message Sent:", response);
        setNewChatList([]);
        getChatsList(limit, 0, recieverType);

        setTimeout(() => {
          scrollToBottom(); // Scroll to bottom after fetching messages
          setIsFetching(false); // Re-enable scrolling
        }, 100); // Small delay to allow DOM update

        setMessage(""); // Clear input after sending
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }

    // Reset editing state after sending or editing
    setEditingMessage(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  console.log(loginResponse, "loginResponse");

  useEffect(() => {
    console.log(chatList, "chatList");
    console.log(senderType, "senderType");
    console.log(recieverType, "recieverType");
    console.log(totalMessages, "totalMessages");
  }, [chatList, senderType, recieverType, totalMessages]);

  const editMessage = (chat) => {
    console.log(chat, "chat_editMessage");
    setMessage(chat?.message); // Set input value to existing message
    setEditingMessage(chat); // Track the message being edited
  };
  const editMessageAPICall = async () => {
    if (!editingMessage) return; // If no message is being edited, return
    let payload = {
      chatId: editingMessage?._id, // Use the chat ID to update the correct message
      message: message,
    };
    try {
      const response = await editChatMessage(payload);
      console.log("Message Edited:", response);
      setPopupMessage("Message has been updated successfully");
      setOpenPopUp(true);
      // await getChatsList(limit, offset, recieverType);
      setMessage(""); // Clear input after editing
      setEditingMessage(null); // Reset editing state
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const deleteMessage = async (chat) => {
    let payload = {
      chatId: chat?._id,
    };
    try {
      const response = await deleteChatMessage(payload);
      console.log("deleteMessage", response);
      if (response?.status) {
        // setPopupMessage("Message has been deleted successfully");
        // setOpenPopUp(true);
        // await getChatsList(10, 0, recieverType);
      }
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  const getUnreadCount = async (limit, offset) => {
    let payload = {
      userId: userId,
    };

    try {
      const response = await getUnreadChatCount(payload);
      setUnreadCounts(response);
      updateUnreadCounts(response); // Update chatUsers dynamically

      console.log("getUnreadChatCount", response);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
    }
  };

  useEffect(() => {
    getUnreadCount();
  }, []);
  useEffect(() => {
    console.log(message, "chatsMessage");
    console.log(unreadCounts, "unreadCounts");
  }, [message, unreadCounts]);

  useEffect(() => {
    getUnreadCount();
  }, [recieverType]);

  // const [hasScrolled, setHasScrolled] = useState(false);

  // useEffect(() => {
  //   if (!hasScrolled && chatContainerRef.current && chatList.length > 0) {
  //     chatContainerRef.current.scrollTop =
  //       chatContainerRef.current.scrollHeight;
  //     setHasScrolled(true); // Prevents further automatic scrolling
  //   }
  // }, [chatList]); // ✅ Runs only on first API response

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  // Handle Scroll Event
  const handleScroll = useCallback(async () => {
    if (!chatContainerRef.current || isFetching) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    console.log(scrollTop, "scrollTop handleScroll");
    console.log(scrollHeight, "scrollHeight handleScroll");
    console.log(clientHeight, "clientHeight handleScroll");
    if (scrollTop === 0) {
      setIsFetching(true);
      try {
        setOffset(offset + limit);
        await getChatsList(limit, offset + limit, recieverType);
      } catch (error) {
        console.error("Error fetching older messages:", error);
      } finally {
        setIsFetching(false);
      }
    }
  }, [isFetching, offset, limit, recieverType, getChatsList]);

  // Attach the scroll handler
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  return (
    <>
      <div>
        <div className="container">
          <div className="row clearfix">
            <div className="col-lg-12">
              <div className="card chat-app">
                <div id="plist" className="people-list">
                  <div className="logoandthreeline">
                    <img className="logochat" src={Group}></img>
                  </div>

                  <div className="chatlistnew">
                    {chatUsers.map((user, index) => (
                      <div
                        key={index}
                        className={`messagemain mb-3 mt-3 ${
                          recieverType === user.type ? "activechat" : ""
                        }`}
                        onClick={() => handleUserClick(user.type)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="about">
                          <div className="chathead">{user.type}</div>
                        </div>
                        <div className="msgcontentandnumber">
                          <div className="msgcontent text-truncate">
                            {user.message}
                          </div>
                          <div className="msgnumber">{user.unread}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="chat"></div>
                <div className="chat">
                  <div className="chat-header clearfix">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div type="submit" className=" chatheadadmin">
                          Group{" "}
                          {recieverType
                            ? recieverType.charAt(0).toUpperCase() +
                              recieverType.slice(1)
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chat-history" ref={chatContainerRef}>
                    <ul className="m-b-0">
                      {newChatList?.newMessages?.map((chat) => (
                        <li className="clearfix" key={chat._id}>
                          <div className="chatmessagecontent">
                            {chat.senderUser === senderType && (
                              <>
                                <div className="dropdown float-right verticaldots">
                                  <div
                                    className=" dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  ></div>
                                  <ul className="dropdown-menu chatulwidth">
                                    <li>
                                      <a
                                        className="dropdown-item chatedit"
                                        onClick={() => {
                                          editMessage(chat);
                                        }}
                                      >
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        className="dropdown-item chatedit"
                                        onClick={() => {
                                          deleteMessage(chat);
                                        }}
                                      >
                                        Delete
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </>
                            )}

                            <div
                              className={`message ${
                                chat.senderUser === senderType
                                  ? "other-message float-right "
                                  : "my-message"
                              }`}
                            >
                              {chat.message}
                            </div>
                            <div className="chatnameandtime">
                              {chat.senderUser != senderType && (
                                <>
                                  <div
                                    className={` ${
                                      chat.senderUser === senderType
                                        ? "chatname"
                                        : "chatnameopp"
                                    }`}
                                  >
<div>
{chat?.senderId?.name},
</div>
<span className="chatspace">
{new Date(
                                      chat.createdAt
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}{" "}
</span>

                                 
                                    
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="chat-message clearfix">
                    <div className="input-group chatttt mb-0">
                      <div className="input-group-prepend">
                        <span
                          className="inputgroup"
                          onClick={handleSendMessage}
                        >
                          <i className="fa fa-send"></i>
                        </span>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter text here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {openPopUp && (
        <PopUp message={popupMessage} closePopup={() => setOpenPopUp(false)} />
      )}{" "}
    </>
  );
};

export default chattillscrollbackup;
