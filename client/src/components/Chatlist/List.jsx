import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import { GET_INITIAL_CONTACTS_ROUTE } from "@/utils/ApiRoutes";
import axios from "axios";
import React, { useEffect } from "react";
import ChatLIstItem from "./ChatLIstItem";

function List() {
  const [{ userInfo, userContacts, filteredContacts }, dispatch] =
    useStateProvider();
  useEffect(() => {
    const getContacts = async () => {
      try {
        const { data } = await axios.get(
          `${GET_INITIAL_CONTACTS_ROUTE}/${userInfo.id}`
        );
        dispatch({
          type: reducerCases.SET_ONLINE_USERS,
          onlineUsers: data.onlineUsers,
        });
        dispatch({
          type: reducerCases.SET_USER_CONTACTS,
          userContacts: data.users,
        });
      } catch (err) {
        console.log(err);
      }
    };
    if (userInfo?.id) {
      getContacts();
    }
  }, [userInfo]);
  return (
    <div className="bg-search-input-container-background flex-auto overflow-auto max-h-full custom-scrollbar">
      {filteredContacts && filteredContacts.length > 0
        ? filteredContacts.map((contact) => {
            return <ChatLIstItem data={contact} key={contact.id} />;
          })
        : userContacts.map((contact) => {
            return <ChatLIstItem data={contact} key={contact.id} />;
          })}
    </div>
  );
}

export default List;
