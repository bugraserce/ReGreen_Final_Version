import React, { useEffect, useState } from 'react'
import { IconButton } from '@mui/material'
import SearchIcon from "@mui/icons-material/Search"
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, anticipate, motion } from "framer-motion"
import axios from "axios";
import { useContext } from 'react'
import { userContext } from '../App'
import pp from "../assets/images/blankPP.jpeg"
import { toast } from 'react-toastify';




const OnlyGroups = () => {

    const loggedUserInformation = useContext(userContext)
    const lightTheme = useSelector((state) => state.themeKey)
    const [groups, setGroups] = useState([])
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        axios.get("http://localhost:3000/fetchGroups")
            .then(response => {
                setGroups(response.data)
                console.log(groups)
            })

    }, [])

    const handleAddselfToGroup = (groupID) => {
        axios.put("http://localhost:3000/addSelfToGroup",
            { chatId: groupID, userId: loggedUserInformation.id })
            .then(response => {
                console.log("addSelfGroupResult : ", response.data);
                // Check if the user is banned
                if (response.data.msg === "You are banned from this group") {
                    toast.error("You are banned from this group");
                } else {
                    toast.success("You have been added to the group successfully");
                    window.location.reload()
                }
            }).catch(err => {
                console.log(err);
                toast.error("You are banned from this group");
            });
    }



    const filtredOnlineGroups = groups.filter(groups => {
        let chatName = "";
        if (groups.chatName) {
            chatName = groups.chatName || ""; // Handle potential undefined value
        }

        return chatName.toLowerCase().includes(searchQuery.toLowerCase());
    });


    useEffect(() => {
        // Function to fetch users from the server
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/search-groups?query=${searchQuery}`);
                setGroups(response.data);
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
    }, [searchQuery]); //



    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
                transition={{ ease: "anticipate", duration: "0.3" }}
                className='list-container'>

                <div className={"ug-header" + ((lightTheme) ? "" : " dark")}>
                    <img src={pp} style={{ height: "2rem", width: "2rem", marginLeft: "10px" }}>

                    </img>
                    <p className={"ug-title" + ((lightTheme) ? "" : " dark")}> Click Community to join! </p>
                </div>

                <div className={"sb-search" + ((lightTheme) ? "" : " dark")}>
                    <IconButton>
                        <SearchIcon />
                    </IconButton>


                    <input
                        placeholder="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={"search-box" + ((lightTheme) ? "" : " dark")}></input>

                </div>
                <div className={"ug-list" + ((lightTheme) ? "" : " dark")}>
                    {filtredOnlineGroups.map((group, index) => (
                        <div key={index} className="list-tem">
                            <p onClick={() => handleAddselfToGroup(group._id)}>{group.chatName}</p>
                        </div>
                    ))}
                </div>



            </motion.div>

        </AnimatePresence>





    );
}

export default OnlyGroups