import React, { useContext } from 'react'
import welcome from "../assets/images/welcome.png"
import { userContext } from '../App'

const WelcomeChat = () => {
    
    const loggedUserInformation = useContext(userContext)
    

    return (
        <div className='welcome-container'>
            WelcomeChat

            <img src={welcome} alt='Welcome' className='welcome-logo' width="80%"></img>
                <p>Hi {loggedUserInformation.username}</p>
            <p>View and text directly to people present in the chat Rooms</p>


        </div>
    )
}

export default WelcomeChat