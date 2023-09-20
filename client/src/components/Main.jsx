import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import {
  CHECK_USER_ROUTE,
  GET_MESSAGES_ROUTE,
  HOST,
  UPDATE_SINGLE_MESSAGE_STATUS,
} from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { io } from "socket.io-client";
import Chat from "./Chat/Chat";
import SearchMessages from "./Chat/SearchMessages";
import VideoCall from "./Call/VideoCall";
import VoiceCall from "./Call/VoiceCall";
import IncomingVideoCall from "./common/IncomingVideoCall";
import IncomingCall from "./common/IncomingCall";

function Main() {
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [
    {
      userInfo,
      currentChatUser,
      messagesSearch,
      videoCall,
      voiceCall,
      incomingVoiceCall,
      incomingVideoCall,
    },
    dispatch,
  ] = useStateProvider();
  const [socketEvent, setSocketEvent] = useState(false);
  const [message_id, setMessageId] = useState(undefined);
  const [send_message_feedback_to, setMessageFeedBackto] = useState(undefined);
  const [latest_message, setLatestMessage] = useState(undefined);
  const socket = useRef();
  const router = useRouter();
  useEffect(() => {
    if (redirectLogin) {
      router.push("/login");
    }
  }, [redirectLogin]);
  onAuthStateChanged(firebaseAuth, async (currentUser) => {
    if (!currentUser) {
      setRedirectLogin(true);
    }
    if (!userInfo && currentUser?.email) {
      const { data } = await axios.post(CHECK_USER_ROUTE, {
        email: currentUser.email,
      });
      if (!data.status) {
        router.push("/login");
      }
      if (data?.data) {
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id: data.data.id,
            name: data.data.name,
            email: data.data.email,
            profileImage: data.data.profilePicture,
            status: data.data.about,
          },
        });
      }
    }
  });

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST);
      socket.current.emit("add-user", { userId: userInfo.id });
      dispatch({ type: reducerCases.SET_SOCKET, socket: socket });
    }
  }, [userInfo]);

  useEffect(() => {
    if (socket.current && !socketEvent) {
      socket.current.on("msg-recieve", (data) => {
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: { ...data.message },
        });
        setMessageId(data.message.id);
        setMessageFeedBackto(data.from);
        setLatestMessage(data.message);
      });

      socket.current.on("incoming-voice-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VOICE_CALL,
          incomingVoiceCall: { ...from, roomId, callType },
        });
      });

      socket.current.on("incoming-video-call", ({ from, roomId, callType }) => {
        dispatch({
          type: reducerCases.SET_INCOMING_VIDEO_CALL,
          incomingVideoCall: { ...from, roomId, callType },
        });
      });

      socket.current.on("voice-call-rejected", () => {
        dispatch({ type: reducerCases.END_CALL });
      });

      socket.current.on("video-call-rejected", () => {
        dispatch({ type: reducerCases.END_CALL });
      });

      socket.current.on("online-users", ({ onlineUsers }) => {
        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers: onlineUsers,
        });
      });

      socket.current.on(
        "message-readed-feedback",
        ({ message_id, currentChatUser, from, message }) => {
          if (currentChatUser === userInfo?.id) {
            dispatch({
              type: reducerCases.UPDATE_MESSAGE_STATUS,
              message_id: message_id,
            });
            dispatch({
              type: reducerCases.UPDATE_USER_CONTACTS_MESSAGES_ONLY,
              id: from,
              message: message,
            });
            socket.current.emit("user_readed_message", {
              to: from,
              from: userInfo?.id,
              message: message,
            });
          } else {
            socket.current.emit("message-update", {
              to: from,
              from: userInfo?.id,
              message: message,
            });
          }
        }
      );

      socket.current.on("message-status-update", ({ from, message }) => {
        dispatch({ type: reducerCases.UPDATE_ALL_MESSAGE_STATUS });
        dispatch({
          type: reducerCases.UPDATE_USER_CONTACTS_MESSAGES_STATUS_ONLY,
          id: from,
          message: message,
        });
      });

      socket.current.on("updating_about_message", ({ from, message }) => {
        dispatch({
          type: reducerCases.INCREMENT_USER_CONTACTS_AND_FILTERED_CONTACTS,
          id: from,
          message: message,
        });
      });

      socket.current.on("updating_recieving_user", ({ from, message }) => {
        dispatch({
          type: reducerCases.UPDATE_USER_CONTACTS_MESSAGES_ONLY,
          id: from,
          message: message,
        });
        dispatch({
          type: reducerCases.UPDATE_USER_CONTACTS_MESSAGES_STATUS_ONLY,
          id: from,
          message: message,
        });
      });

      setSocketEvent(true);
      ("");
    }
  }, [socket.current]);

  useEffect(() => {
    const getMessages = async () => {
      const { data } = await axios.get(
        `${GET_MESSAGES_ROUTE}/${userInfo?.id}/${currentChatUser?.id}`
      );
      dispatch({ type: reducerCases.SET_MESSAGES, messages: data.message });
      socket.current.emit("update-message-status", {
        to: currentChatUser.id,
        from: userInfo.id,
        message: data.message[0],
      });
    };
    if (currentChatUser?.id) {
      getMessages();
    }
  }, [currentChatUser]);

  useEffect(() => {
    if (socket.current) {
      socket.current.emit("message-readed", {
        currentChatUser: currentChatUser?.id,
        to: send_message_feedback_to,
        message_id: message_id,
        from: userInfo?.id,
        message: latest_message,
      });
    }
  }, [message_id]);

  // useEffect(() => {
  //   var timerID = setInterval(
  //     () =>
  //       console.log("hello"),
  //     1000
  //   );

  //   return () => clearInterval(timerID);
  // });

  return (
    <>
      {incomingVideoCall && <IncomingVideoCall />}
      {incomingVoiceCall && <IncomingCall />}
      {videoCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VideoCall />
        </div>
      )}

      {voiceCall && (
        <div className="h-screen w-screen max-h-full overflow-hidden">
          <VoiceCall />
        </div>
      )}

      {!videoCall && !voiceCall && (
        <div className="grid grid-cols-main h-screen w-screen max-h-screen max-w-full overflow-hidden">
          <ChatList />
          {currentChatUser ? (
            <div
              className={messagesSearch ? "grid grid-cols-2" : "grid-cols-2"}
            >
              <Chat />
              {messagesSearch && <SearchMessages />}
            </div>
          ) : (
            <Empty />
          )}
        </div>
      )}
    </>
  );
}

export default Main;
