import { reducerCases } from "./constants";

export const initialState = {
  userInfo: undefined,
  newUser: false,
  contactsPage: false,
  currentChatUser: undefined,
  messages: [],
  socket: undefined,
  messagesSearch: false,
  userContacts: [],
  onlineUsers: [],
  filteredContacts: [],
  contactSearch: "",
  videoCall: undefined,
  voiceCall: undefined,
  incomingVoiceCall: undefined,
  incomingVideoCall: undefined,
};

const reducer = (state, action) => {
  switch (action.type) {
    case reducerCases.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.userInfo,
      };
    case reducerCases.SET_NEW_USER:
      return {
        ...state,
        newUser: action.newUser,
      };
    case reducerCases.SET_ALL_CONTACTS_PAGE:
      return {
        ...state,
        contactsPage: !state.contactsPage,
      };
    case reducerCases.CHANGE_CURRENT_CHAT_USER:
      return {
        ...state,
        currentChatUser: action.user,
      };
    case reducerCases.SET_MESSAGES:
      return {
        ...state,
        messages: action.messages,
      };
    case reducerCases.SET_SOCKET:
      return {
        ...state,
        socket: action.socket,
      };
    case reducerCases.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.newMessage],
      };
    case reducerCases.SET_MESSAGE_SEARCH:
      return {
        ...state,
        messagesSearch: !state.messagesSearch,
      };
    case reducerCases.SET_USER_CONTACTS:
      return {
        ...state,
        userContacts: action.userContacts,
      };
    case reducerCases.SET_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: action.onlineUsers,
      };
    case reducerCases.SET_CONTACT_SEARCH: {
      const filteredContacts = state.userContacts.filter((contact) =>
        contact.name.toLowerCase().includes(action.contactSearch.toLowerCase())
      );
      return {
        ...state,
        contactSearch: action.contactSearch,
        filteredContacts,
      };
    }
    case reducerCases.SET_VIDEO_CALL:
      return {
        ...state,
        videoCall: action.videoCall,
      };
    case reducerCases.SET_VOICE_CALL:
      return {
        ...state,
        voiceCall: action.voiceCall,
      };
    case reducerCases.SET_INCOMING_VOICE_CALL:
      return {
        ...state,
        incomingVoiceCall: action.incomingVoiceCall,
      };
    case reducerCases.SET_INCOMING_VIDEO_CALL:
      return {
        ...state,
        incomingVideoCall: action.incomingVideoCall,
      };
    case reducerCases.END_CALL:
      return {
        ...state,
        voiceCall: undefined,
        videoCall: undefined,
        incomingVideoCall: undefined,
        incomingVoiceCall: undefined,
      };
    case reducerCases.SET_EXIT_CHAT:
      return {
        ...state,
        currentChatUser: undefined,
      };
    case reducerCases.UPDATE_MESSAGE_STATUS:
      let get_message_index = undefined;
      state.messages.map((message, index) => {
        if (message.id === action.message_id) {
          get_message_index = index;
        }
      });
      if (get_message_index) {
        state.messages[get_message_index] = {
          ...state.messages[get_message_index],
          messageStatus: "read",
        };
      }
      return {
        ...state,
      };
    case reducerCases.UPDATE_ALL_MESSAGE_STATUS:
      state.messages.map((message, index) => {
        state.messages[index] = {
          ...state.messages[index],
          messageStatus: "read",
        };
      });
      return {
        ...state,
      };
    case reducerCases.UPDATE_USER_CONTACTS_AND_FILTERED_CONTACTS:
      state.userContacts.map((contact, index) => {
        if (state.userContacts[index].id === action.id) {
          state.userContacts[index] = {
            ...state.userContacts[index],
            totalUnreadMessages: 0,
          };
        }
      });
      state.filteredContacts.map((contact, index) => {
        if (state.filteredContacts[index].id === action.id) {
          state.filteredContacts[index] = {
            ...state.filteredContacts[index],
            totalUnreadMessages: 0,
          };
        }
      });
      return {
        ...state,
      };
    case reducerCases.INCREMENT_USER_CONTACTS_AND_FILTERED_CONTACTS:
      state.userContacts.map((contact, index) => {
        if (state.userContacts[index].id === action.id) {
          state.userContacts[index] = {
            ...state.userContacts[index],
            totalUnreadMessages:
              state.userContacts[index].totalUnreadMessages + 1,
            message: action.message.message,
            senderId: action.message.senderId,
            recieverId: action.message.recieverId,
            createdAt: action.message.createdAt,
            type: action.message.type,
            messageStatus: action.message.messageStatus,
          };
        }
      });
      state.filteredContacts.map((contact, index) => {
        if (state.filteredContacts[index].id === action.id) {
          state.filteredContacts[index] = {
            ...state.filteredContacts[index],
            totalUnreadMessages:
              state.filteredContacts[index].totalUnreadMessages + 1,
            message: action.message.message,
            senderId: action.message.senderId,
            recieverId: action.message.recieverId,
            createdAt: action.message.createdAt,
            type: action.message.type,
            messageStatus: action.message.messageStatus,
          };
        }
      });
      return {
        ...state,
      };
    case reducerCases.UPDATE_USER_CONTACTS_MESSAGES_ONLY:
      state.userContacts.map((contact, index) => {
        if (state.userContacts[index].id === action.id) {
          state.userContacts[index] = {
            ...state.userContacts[index],
            message: action.message.message,
            senderId: action.message.senderId,
            recieverId: action.message.recieverId,
            createdAt: action.message.createdAt,
            type: action.message.type,
            messageStatus: "read",
          };
        }
      });
      state.filteredContacts.map((contact, index) => {
        if (state.filteredContacts[index].id === action.id) {
          state.filteredContacts[index] = {
            ...state.filteredContacts[index],
            message: action.message.message,
            senderId: action.message.senderId,
            recieverId: action.message.recieverId,
            createdAt: action.message.createdAt,
            type: action.message.type,
            messageStatus: "read",
          };
        }
      });
      return {
        ...state,
      };
    case reducerCases.UPDATE_USER_CONTACTS_MESSAGES_STATUS_ONLY:
      state.userContacts.map((contact, index) => {
        if (state.userContacts[index].id === action.id) {
          state.userContacts[index] = {
            ...state.userContacts[index],
            messageStatus: action.message.messageStatus,
            senderId: action.message.senderId,
            recieverId: action.message.recieverId,
            createdAt: action.message.createdAt,
            type: action.message.type,
          };
        }
      });
      state.filteredContacts.map((contact, index) => {
        if (state.filteredContacts[index].id === action.id) {
          state.filteredContacts[index] = {
            ...state.filteredContacts[index],
            messageStatus: action.message.messageStatus,
            senderId: action.message.senderId,
            recieverId: action.message.recieverId,
            createdAt: action.message.createdAt,
            type: action.message.type,
          };
        }
      });
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default reducer;
