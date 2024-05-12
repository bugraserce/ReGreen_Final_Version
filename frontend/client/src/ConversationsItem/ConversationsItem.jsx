import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'

const ConversationsItem = ({ props }) => {

  const lightTheme = useSelector((state) => state.themeKey)

    const navigate = useNavigate();

  return (
  
  <div className={"conversation-container" + ((lightTheme)? "" : " dark") } 
  
  onClick={ () =>{navigate("chatArea")} }>
    

      <p className='first-letter'> {props.name[0]}</p>
      <p className='test-name'>{props.name}</p>
      <p className='last-message '>{props.lastMessage}</p>
      <p className='date'>{props.timeStamp}</p>


    </div>



  )
}

export default ConversationsItem