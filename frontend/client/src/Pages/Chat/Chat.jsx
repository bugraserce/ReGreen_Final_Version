import "./Chat.css"
import MainContainer from '../../MainContainer(Chat)/MainContainer'
import FeederNav from '../../FeederNav/FeederNav'
import { useContext, useEffect } from "react"
import { userContext } from "../../App"
import { useNavigate } from "react-router-dom";


const Chat = () => {
  const navigate = useNavigate()

  

  return (
    <div className='App'>
      <FeederNav></FeederNav>
      <MainContainer></MainContainer>
    </div>
  )
}

export default Chat
