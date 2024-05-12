import React, { useContext } from 'react';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import { IconButton } from '@mui/material';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from "framer-motion";
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { userContext } from '../App';



const CreateGroups = () => {
    const loggedUserInformation = useContext(userContext);
    const lightTheme = useSelector((state) => state.themeKey);
    const [groupName, setGroupName] = useState("");
    const [groupPhoto, setGroupPhoto] = useState(null); // State to store group photo file
    const navigate = useNavigate();

    const handleCreateGroup = (e) => {
        e.preventDefault(); // Prevent default form submission
        // Add your logic here to handle group creation
        console.log("Group Name:", groupName);

        const formData = new FormData();
        formData.append('name', groupName);
        formData.append('users', loggedUserInformation.id);
        if (groupPhoto) {
            formData.append('groupPhoto', groupPhoto);
        }

        axios.post("http://localhost:3000/createGroup", formData)
            .then(response => {
                console.log(response);
                if (response.status === 200) {
                    console.log("Operation successful");
                    navigate("/messages/groups");
                }
            })
            .catch(error => {
                console.error('Error creating group:', error);
            });
    };

    const handleGroupPhotoChange = (e) => {
        const file = e.target.files[0];
        setGroupPhoto(file);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ ease: "anticipate", duration: "0.3" }}
            className='createGroups-container'
        >
            <form className={"" + ((lightTheme) ? "" : " dark")}
                onSubmit={handleCreateGroup}>
                <input
                    placeholder="Create Community"
                    onChange={(e) => setGroupName(e.target.value)}
                    className={"search-box" + ((lightTheme) ? "" : " dark")}
                />
                {/* Input field for uploading group photo */}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleGroupPhotoChange}
                    className={"" + ((lightTheme) ? "" : " dark")}
                />
                <IconButton className={"" + ((lightTheme) ? "" : " dark")}
                    type="submit">
                    <DoneOutlineIcon />
                </IconButton>
            </form>
        </motion.div>
    );
};

export default CreateGroups;
