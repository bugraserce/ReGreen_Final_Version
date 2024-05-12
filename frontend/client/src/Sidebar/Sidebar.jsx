import "../MainContainer(Chat)/Style.css"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { IconButton } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NightlightIcon from '@mui/icons-material/Nightlight';
import SearchIcon from '@mui/icons-material/Search';
import ConversationsItem from "../ConversationsItem/ConversationsItem";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LightModeIcon from '@mui/icons-material/LightMode';
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/ThemeSlice";
import axios from "axios";
import { userContext } from "../App";
import ExitToApp from "@mui/icons-material/ExitToApp";
const Sidebar = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loggedUserInformation = useContext(userContext)
  const lightTheme = useSelector((state) => state.themeKey)

  const [conversations, setConversations] = useState([])
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredConversations, setFilteredConversations] = useState([]);



  useEffect(() => {
    axios.get("http://localhost:3000/getChats")
      .then(response => {
        console.log(response.data)
        setConversations(response.data)
      })


  }, [])

  const hasNotificationsUSERS = conversations.map((conversation, index) => {
    // Determine the "other user" message in the conversation; assumes two users per conversation
    const otherUserID = conversation.messageNotifications.find(id => id !== loggedUserInformation.id);

    // Count notifications sent to the logged-in user by the other user
    const notificationsCount = conversation.messageNotifications.filter(id => id === otherUserID).length;

    // Conditionally render the notification count for the logged-in user
    if (notificationsCount > 0) {
      return (
        <div key={conversation._id || index}>
          {notificationsCount}
        </div>
      );
    }
    return <div key={conversation._id || index}> <span></span></div>;
  });


  const filterConversations = () => {

    const filtered = conversations.filter(conversation => {

      const chatName = conversation.isGroupChat ? conversation.chatName : conversation.users.find(user => user._id !== loggedUserInformation.id)?.username || "";

      return chatName.toLowerCase().includes(searchQuery.toLocaleLowerCase())


    })

    setFilteredConversations(filtered)

  }

  useEffect(() => {
    filterConversations();



  }, [searchQuery, conversations]);


  const resetNotifications = (otherUserID, chatID) => {

    console.log("otherUSERIDDDDD", otherUserID )

    axios.delete('http://localhost:3000/clearMessageNotifications', { 
      data: { otherUserID, chatID } // Pass data object with keys and values
    })
      .then(response => {
        console.log("reset.Notifcaiton", response.data)
      })
      .catch(error => {
        console.error("Error resetting notifications:", error);
      });
}

  return (
    <div className="sidebar-container">

      <div className={"sb-header" + ((lightTheme) ? "" : " dark")}>
        

        <div>
          <IconButton onClick={() => { navigate("users") }}>
            <PersonAddIcon className={"icon" + ((lightTheme) ? "" : " dark")} />
          </IconButton>

          <IconButton  onClick={() => { navigate("groups") }}>
            <GroupAddIcon className={"icon" + ((lightTheme) ? "" : " dark")} />
          </IconButton>

          <IconButton  onClick={() => { navigate("createCommunity") }}>
            <AddCircleIcon className={"icon" + ((lightTheme) ? "" : " dark")} />
          </IconButton>
          
          <IconButton onClick={() => { dispatch(toggleTheme()) }} >
            {lightTheme && <NightlightIcon />}
            {!lightTheme && <LightModeIcon className={"icon" + ((lightTheme) ? "" : " dark")} />}
          </IconButton>

          
          


        </div>


      </div>

      <div className={"sb-search" + ((lightTheme) ? "" : " dark")}>
        <IconButton>
          <SearchIcon className={"icon" + ((lightTheme) ? "" : " dark")} />
        </IconButton>


        <input
          placeholder="search"
          className={"search-box" + ((lightTheme) ? "" : " dark")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

      </div>

      <div className={"sb-conversations" + (lightTheme ? "" : " dark")}>
        
        {conversations && filteredConversations.map((conversation, index) => {
          let chatName = "";
          let groupPhoto = "";
          let otherUser = null; // Define otherUser variable
          let chatID = conversation._id
          console.log("sideBarChatid:",chatID)
          if (conversation.isGroupChat) {
            chatName = conversation.chatName;
            groupPhoto = conversation.groupPhoto; // Get the group photo
          } else {
            // Find the other user in the conversation
            otherUser = conversation && conversation.users && conversation.users.find(user => user._id !== loggedUserInformation.id);
            var otherUserID = otherUser && otherUser._id
            console.log("sidebarReceiver:", otherUserID)
            if (otherUser) {
              chatName = otherUser.username;
              groupPhoto = otherUser.ProfilPhoto;
            }
          }
          const lastMessageContent = conversation.lastMessage ? conversation.lastMessage.content : "";
          return (
            <div key={index}  onClick={() => {
              navigate(`chatArea/${conversation._id}/${conversation.chatName}`);
              resetNotifications(otherUserID, chatID);}} 
           className="conversation-container cursor-pointer hover:text-white ">
              {groupPhoto && (
                <img
                  src={`http://localhost:3000/Images/${groupPhoto}`} // Assuming group photo is stored in the 'Images' directory
                  className="w-50 rounded-full"
                  alt={chatName}
                />
              )}
              <div
                className="flex items-center text-primary hover:text-white">
              
                <span className="text-base">{chatName}</span>
                <p className="justify-center font-bold text-sm ml-3 ">{hasNotificationsUSERS}</p>
              </div>
              {/* Pass otherUser to resetNotifications function rounded bg-gray-100 w-[45px] h-[45px]*/}

            </div>
          );
        })}
      </div>



    </div>
  )
}

export default Sidebar