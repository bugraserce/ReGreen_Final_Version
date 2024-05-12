import React, { useEffect, useState } from 'react'
import { IconButton } from '@mui/material'
import SearchIcon from "@mui/icons-material/Search"
import pp from "../assets/images/blankPP.jpeg"
import { useSelector } from 'react-redux'
import { AnimatePresence, motion } from "framer-motion"
import axios from "axios";


const UserAndGroups = () => {
    const lightTheme = useSelector((state) => state.themeKey)
    const [users, setUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Function to fetch users from the server
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/search-users?query=${searchQuery}`);
                setUsers(response.data);
                console.log(response.data); // Check the fetched users in the console
            } catch (error) {
                console.error("Error fetching users:", error);
                // Handle error if needed
            }
        };

        // Fetch users when the component mounts or when the search query changes
        fetchUsers();

        // Cleanup function
        return () => {
            // You can perform cleanup here if needed
        };
    }, [searchQuery]); // Run the effect whenever the searchQuery state changes


    const sendClickUserIDandUsername = (userID,ClickedUsername) => {
        axios.post("http://localhost:3000/newChat", { userID: userID ,username:ClickedUsername})
            .then(response => {
                console.log(response);
            })
            window.location.reload()
            .catch(error => {
                console.error("Error creating new chat:", error);
                // Handle error if needed
            });
    }


    const filtredOnlineUser = users.filter(user => {
        let chatName = "";
        if (user.username) {
            chatName = user.username || ""; // Handle potential undefined value
        } 
    
        return chatName.toLowerCase().includes(searchQuery.toLowerCase());
    });
    


    return (

        <AnimatePresence>

            <motion.div initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                transition={{ ease: "anticipate", duration: "0.3" }} className='list-container'>

                <div className={"ug-header" + ((lightTheme) ? "" : " dark")}>
                    <p className='font-bold'>Click Users to start a Chat!</p>

                    
                    <p className='ug-title'>Online Users </p>
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
                     ></input>

                </div>

                <div className={"ug-list cursor-pointer" + (lightTheme ? "" : " dark")}>
                    {users && filtredOnlineUser.map((user, index) => (
                        <div key={index}>
                            <div className='list-tem' onClick={() => sendClickUserIDandUsername(user._id,user.username)}>
                                <img src={`http://localhost:3000/Images/${user.ProfilPhoto}`} className="w-20 rounded-full" />
                                <p>{user.username}</p>
                            </div>
                        </div>
                    ))}
                </div>





            </motion.div>


        </AnimatePresence>





    );
}

export default UserAndGroups