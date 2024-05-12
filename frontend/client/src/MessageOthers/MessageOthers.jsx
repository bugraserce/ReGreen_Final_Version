import React from 'react'

const MessageOthers = ({props}) => {
  
    const messageTime = new Date(props.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const nameForOnlyGroupChat = props && props.sender && props.sender.username
    
    return (
        <div className='other-message-container'>

            <div className=''>

             
                <div className='other-text-content'>
                <p className='text-primary font-bold'>{nameForOnlyGroupChat? nameForOnlyGroupChat : props.username}</p>
                <p className='test-name'>{props.content ? props.content : props}</p>
                <p className='self-timeStamp'>{messageTime}</p>
                </div>
                

            </div>


        </div>
    )
}

export default MessageOthers