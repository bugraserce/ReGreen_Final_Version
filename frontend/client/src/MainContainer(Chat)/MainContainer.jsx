import { useState } from "react"
import ChatArea from "../ChatArea/ChatArea"
import Sidebar from "../Sidebar/Sidebar"
import "./Style.css"
import WelcomeChat from "../WelcomeChat/WelcomeChat"
import CreateGroups from "../CreateGroups/CreateGroups"
import UserAndGroups from "../UserAndGroups/UserAndGroups"
import { Outlet } from "react-router-dom"
import { useSelector } from "react-redux"

const MainContainer = () => {
  
  const lightTheme = useSelector((state) => state.themeKey)
  
  return (
    <div className={"main-container" + ((lightTheme)? "" : " dark") }>
    
      <Sidebar />
      <Outlet/>
    {/*  <WelcomeChat /> */} 
    {/*<CreateGroups/> */}
    {/*<ChatArea props={conversation[0]}></ChatArea> */}  
    
    {/* <UserAndGroups/> */}
    
    
    
    </div>


  )
}

export default MainContainer