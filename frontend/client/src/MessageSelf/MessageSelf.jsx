import React from 'react'

const MessageSelf = ({props}) => {
  
  const messageTime = new Date(props.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  //console.log(props); 
  return (
    <div className='self-message-container'>
        <div className='messageBox'>
            <p>{props.content}</p>
            <p className='self-timeStamp'>{messageTime}</p>
        </div>
    
    
    
    </div>
  )
}

export default MessageSelf