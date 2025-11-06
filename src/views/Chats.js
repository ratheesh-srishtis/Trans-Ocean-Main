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
import Loader from "../pages/Loader";

import { useChat } from "./ChatContext";
const Chats = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { getChatUnreadCount } = useChat();
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
  const [chatLogos, setChatLogos] = useState(null);
  const [recieverType, setRecieverType] = useState("admin");
  const chatHistoryRef = useRef(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isSideMenuClicked, setIsSideMenuClicked] = useState(null);
  const [actionType, setActionType] = useState(null); // Track the type of action (send, edit, delete)
  const [chatUsers, setChatUsers] = useState([
    { type: "Admin", message: "Lorem ipsum dolor sit amet....", unread: 0 },
    { type: "Finance", message: "Lorem ipsum dolor sit amet....", unread: 0 },
    {
      type: "Operations",
      message: "Lorem ipsum dolor sit amet....",
      unread: 0,
    },
    { type: "HR", message: "Lorem ipsum dolor sit amet....", unread: 0 },
  ]);

  const updateUnreadCounts = (data) => {
    console.log(data, "data");
    const updatedChatUsers = chatUsers.map((user) => {
      let unreadCount = 0;
      let lastMessage = "";
      let logo = "";
      switch (user.type?.toLocaleLowerCase()) {
        case "admin":
          unreadCount = data?.adminChatCount || 0;
          lastMessage = data?.adminLastChat || "";
          logo = `${process.env.REACT_APP_ASSET_URL}${chatLogos?.adminDepartmentLogo}`;
          break;
        case "finance":
          unreadCount = data?.financeChatCount || 0;
          lastMessage = data?.financeLastChat || "";
          logo = `${process.env.REACT_APP_ASSET_URL}${chatLogos?.financeDepartmentLogo}`;
          break;
        case "operations":
          unreadCount = data?.operationsChatCount || 0;
          lastMessage = data?.operationsLastChat || "";
          logo = `${process.env.REACT_APP_ASSET_URL}${chatLogos?.operationsDepartmentLogo}`;

          break;
        case "hr":
          unreadCount = data?.hrChatCount || 0;
          lastMessage = data?.hrLastChat || "";
          logo = `${process.env.REACT_APP_ASSET_URL}${chatLogos?.hrDepartmentLogo}`;

          break;
        default:
          unreadCount = 0;
      }

      return { ...user, unread: unreadCount, message: lastMessage, logo };
    });

    setChatUsers(updatedChatUsers);
  };

  useEffect(() => {
    console.log(chatUsers, "chatUsers");
  }, [chatUsers]);

  const handleUserClick = async (type) => {
    // Call the unread count update function
    setIsSideMenuClicked(true);
    setNewChatList([]);
    setRecieverType(type);
    console.log("Selected User Type:", type);
    setOffset(0);
    // getChatsList(limit, 0, type, "handleUserClick");
    // Wait for the chat messages to load
    const chatLoaded = await getChatsList(limit, 0, type, "handleUserClick");
    console.log(chatLoaded, "chatLoaded");
    // Scroll to bottom only if the chat messages were loaded successfully
    if (chatLoaded) {
      scrollToBottom();
    }
  };

  const getChatsList = async (limit, offset, type, from) => {
    // alert(`called from ${from}`);
    console.log(`called from ${from}`);
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
      let newMessages = response?.chat ? [...response.chat].reverse() : []; // Reverse the new messages
      console.log(newMessages, "newMessages");
      setNewChatList((prevChat) => ({
        ...prevChat,
        newMessages: [...newMessages, ...(prevChat?.newMessages || [])], // Prepend instead of append
      }));
      getChatUnreadCount();
      return true; // Indicate that the chat messages have been loaded
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      return false; // Indicate that the chat messages have been loaded
    }
  };

  useEffect(() => {
    console.log(newChatList, "newChatList_full");
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
        departmentLogoId: unreadCounts?.departmentLogoId,
      };
      try {
        const response = await saveChatMessage(payload);
        console.log("Message Sent:", response);
        setNewChatList([]);
        getChatsList(limit, 0, recieverType, "sendMessage");
        setActionType("send"); // Set action type to "send"
        setMessage(""); // Clear input after sending
        getUnreadCount();
        // Reset the textarea height to default (1 row)
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"; // Reset height
          textareaRef.current.style.height = "24px"; // Set to default height (adjust as needed)
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
    // Reset editing state after sending or editing
    setEditingMessage(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      // Send message on Enter (without Shift)
      e.preventDefault(); // Prevent default behavior (new line)
      handleSendMessage();
    }
    // Allow Shift + Enter to insert a new line
    // No action needed here as <textarea> handles it automatically
  };

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

      // Update the newChatList array directly
      setNewChatList((prevChatList) => {
        const updatedMessages = prevChatList.newMessages.map((chat) => {
          if (chat._id === editingMessage._id) {
            return { ...chat, message: message }; // Update the message
          }
          return chat;
        });

        return { ...prevChatList, newMessages: updatedMessages };
      });

      setPopupMessage("Message has been updated successfully");
      setOpenPopUp(true);
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
        // Update the newChatList array directly
        setNewChatList((prevChatList) => {
          const updatedMessages = prevChatList.newMessages.filter(
            (item) => item._id !== chat._id // Remove the deleted message
          );

          return { ...prevChatList, newMessages: updatedMessages };
        });

        setPopupMessage("Message has been deleted successfully");
        setOpenPopUp(true);
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const getUnreadCount = async (limit, offset) => {
    setIsLoading(true);
    let payload = {
      userId: userId,
    };
    try {
      const response = await getUnreadChatCount(payload);
      setUnreadCounts(response);
      setChatLogos(response);
      updateUnreadCounts(response); // Update chatUsers dynamically
      console.log("getUnreadChatCount", response);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch quotations:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateUnreadCounts(chatLogos);
  }, [chatLogos]);

  useEffect(() => {
    getUnreadCount();
  }, []);

  useEffect(() => {
    getUnreadCount();
  }, [recieverType]);

  // Create a ref to store the latest value of newChatList
  const newChatListRef = useRef(newChatList);

  // Update the ref whenever newChatList changes
  useEffect(() => {
    newChatListRef.current = newChatList;
  }, [newChatList]);

  // Create a ref to store the latest value of totalMessages
  const totalMessagesRef = useRef(totalMessages);

  // Update the ref whenever totalMessages changes
  useEffect(() => {
    totalMessagesRef.current = totalMessages;
  }, [totalMessages]);

  useEffect(() => {
    const chatHistory = chatHistoryRef.current;
    if (!chatHistory) return;
    const handleScroll = async () => {
      console.log(isFirstLoad, "isFirstLoad");

      // Ignore the initial load
      if (isInitialLoad) {
        setIsInitialLoad(false); // Mark initial load as complete
        return;
      }

      if (chatHistory.scrollTop === 0) {
        // Stop fetching if we already have all messages
        console.log(
          newChatList?.newMessages?.length,
          "newChatList?.newMessages?.length handleScroll"
        );
        console.log(totalMessages, "totalMessages handleScroll");
        // if (newChatList?.newMessages?.length >= totalMessages) return;
        // Use the ref value instead of newChatList directly
        if (
          newChatListRef.current?.newMessages?.length >=
          totalMessagesRef.current
        )
          return;
        const previousHeight = chatHistory.scrollHeight; // Store current height
        await getChatsList(10, offset + 10, recieverType, "handleScroll"); // Fetch next batch
        requestAnimationFrame(() => {
          // Maintain the exact scroll position by adjusting scrollTop
          chatHistory.scrollTop += chatHistory.scrollHeight - previousHeight;
        });
        if (offset >= totalMessages) {
          setOffset(0);
        } else {
          setOffset(offset + 10);
        }
      }
    };
    chatHistory.addEventListener("scroll", handleScroll);
    return () => chatHistory.removeEventListener("scroll", handleScroll);
  }, [isInitialLoad]); // Only run when offset or total messages change

  useEffect(() => {
    console.log(offset, "offset");
  }, [offset]);

  const scrollToBottom = () => {
    // alert("scrollToBottom");
    setTimeout(() => {
      const chatHistory = chatHistoryRef.current;
      if (chatHistory) {
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  useEffect(() => {
    if (actionType === "send") {
      scrollToBottom(); // Scroll to bottom only when a new message is sent
    }
    setActionType(null); // Reset the action type after handling
  }, [newChatList]); // Trigger when newChatList changes

  // Fetch initial messages & scroll to bottom only once
  useEffect(() => {
    getChatsList(10, 0, "admin", "initialLoading").then(() => {
      if (isFirstLoad) {
        scrollToBottom();
        // setIsFirstLoad(false); // Mark that initial load is done
      }
    });
  }, []); // Run only on first render

  const formatReceiverType = (receiverType) => {
    if (!receiverType) return "";

    // Special case for 'hr'
    if (receiverType.toLowerCase() === "hr") {
      return "HR";
    }

    // Capitalize the first letter for other cases
    return receiverType.charAt(0).toUpperCase() + receiverType.slice(1);
  };

  // Create a ref for the textarea
  const textareaRef = useRef(null);

  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto"; // Reset height to auto
    textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scroll height
  };

  return (
    <>
      <div>
        <div className="container">
          <div className="row clearfix">
            <div className="col-lg-12">
              <div className="card chat-app">
                <div id="plist" className="people-list">
                  {/* <div className="logoandthreeline">
                    <img className="logochat" src={Group}></img>
                  </div> */}

                  <div className="chatlistnew">
                    {chatUsers.map((user, index) => (
                      <div
                        key={index}
                        className={`messagemain chatnewsty mb-3 mt-3 ${
                          recieverType === user.type?.toLowerCase()
                            ? "activechat"
                            : ""
                        }`}
                        onClick={() =>
                          handleUserClick(user.type?.toLowerCase())
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <div className="chatborder"></div>
                        <div className="user-logo">
                          <img className="dept-logo" src={user?.logo} alt="" />
                        </div>
                        <div>
                          {" "}
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
                          Group {formatReceiverType(recieverType)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="chat-history scrollchat" ref={chatHistoryRef}>
                    <ul className="m-b-0">
                      {newChatList?.newMessages?.map((chat) => {
                        // pick logo based on senderUser
                        let logoPath = "";
                        if (
                          chat?.senderUser === "admin" ||
                          chat?.senderUser === "superadmin"
                        ) {
                          logoPath =
                            chat?.departmentLogoId?.adminDepartmentLogo;
                        } else if (chat?.senderUser === "finance") {
                          logoPath =
                            chat?.departmentLogoId?.financeDepartmentLogo;
                        } else if (chat?.senderUser === "operations") {
                          logoPath =
                            chat?.departmentLogoId?.operationsDepartmentLogo;
                        } else if (chat?.senderUser === "hr") {
                          logoPath = chat?.departmentLogoId?.hrDepartmentLogo;
                        }
                        return (
                          <li className="clearfix" key={chat._id}>
                            <div className="chatmessagecontent">
                              {chat.senderId?._id ===
                                loginResponse?.data?._id && (
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
                                style={{ whiteSpace: "normal" }} // This is the key fix
                              >
                                {chat.message}
                              </div>

                              <div className="chatnameandtime">
                                <div
                                  className={` ${
                                    chat.senderUser === senderType
                                      ? "chatname"
                                      : "chatnameopp"
                                  }`}
                                >
                                  <span>
                                    {logoPath && (
                                      <img
                                        src={`${process.env.REACT_APP_ASSET_URL}${logoPath}`}
                                        alt={`${chat?.senderUser} logo`}
                                        className="dept-logo"
                                      />
                                    )}
                                    {chat?.senderId?.name}{" "}
                                    <span className="chatcomma">,</span>
                                  </span>
                                  <span className="chatspace">
                                    {(() => {
                                      const date = new Date(chat.createdAt);
                                      const day = date
                                        .getDate()
                                        .toString()
                                        .padStart(2, "0");
                                      const month = (date.getMonth() + 1)
                                        .toString()
                                        .padStart(2, "0"); // Months are 0-based
                                      const year = date.getFullYear();
                                      let hours = date.getHours();
                                      const minutes = date
                                        .getMinutes()
                                        .toString()
                                        .padStart(2, "0");
                                      const ampm = hours >= 12 ? "PM" : "AM";

                                      hours = hours % 12 || 12; // Convert to 12-hour format

                                      return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  {/* <div className="chat-message clearfix">
                    <div className="input-group mb-0">
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
                  </div> */}

                  <div className="chat-message clearfix">
                    <div className="input-groupchatt mb-0">
                      <textarea
                        ref={textareaRef} // Attach the ref
                        className="form-control textchat"
                        placeholder="Enter text here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1} // Start with 1 row, but it will expand as needed
                        style={{
                          resize: "none", // Disable manual resizing
                          overflow: "hidden", // Hide scrollbar
                          whiteSpace: "pre-wrap", // Allow text to wrap
                        }}
                        onInput={handleInput}
                      />
                      <div className="input-group-prepend">
                        <span
                          className="inputgroup"
                          onClick={handleSendMessage}
                        >
                          <i className="bi bi-send-fill sendchat"></i>
                        </span>
                      </div>
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
      <Loader isLoading={isLoading} />
    </>
  );
};
export default Chats;
