import React, { useContext, useEffect, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MessageOthers from '../MessageOthers/MessageOthers';
import MessageSelf from '../MessageSelf/MessageSelf';
import { useSelector } from 'react-redux';
import { userContext } from '../App';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import 'react-toastify/dist/ReactToastify.css';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import blankPP from "../assets/images/blankPP.jpeg"
import BlockIcon from '@mui/icons-material/Block';
import ExitToApp from "@mui/icons-material/ExitToApp";




const ChatArea = () => {
    const navigate = useNavigate();

    const lightTheme = useSelector((state) => state.themeKey);
    const loggedUserInformation = useContext(userContext);
    const [messageContent, setMessageContent] = useState('');
    const [allMessages, setAllMessages] = useState([]);
    const { chatId, chatName } = useParams();
    const [loaded, setLoaded] = useState(false);
    const [socketConnectionStatus, setSocketConnectionStatus] = useState(false);
    const [conversations, setConversations] = useState([])
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [receiverID, setReceiverID] = useState()
    const myID = loggedUserInformation.id
    const [socket, setSocket] = useState(null);
    const ENDPOINT = 'http://localhost:3000';
    const [groupUsers, setGroupUsers] = useState([])
    const [showGroupUsersList, setShowGroupUsersList] = useState(false)
    const [showGroupUsersOptions, setShowGroupUsersOptions] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showBannedUsersList, setShowBannedUsersList] = useState(false)


    useEffect(() => {
        const socket = io(ENDPOINT);
        setSocket(socket);

        socket.on('connect', () => {
            console.log('Socket connected successfully');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });


    }, []);




    useEffect(() => {
        // Fetch chat messages after socket connection is established
        if (socket) {
            socket.emit('setup', loggedUserInformation);
            socket.emit('joinChat', chatId);

            axios.get(`http://localhost:3000/getChatid/${chatId}`)
                .then((response) => {
                    console.log('GETCHAT:', response.data);
                    setAllMessages(response.data); // Assuming response.data contains messages
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }, [socket, chatId, loggedUserInformation,allMessages]);// Make sure to include chatId in the dependency array


    const sendMessage = () => {
        if (!messageContent || !chatId) {
            console.error('Missing message content or chat ID');
            return;
        }

        // Send message to server via HTTP POST request
        axios.post('http://localhost:3000/sendMessage', { content: messageContent, chatId: chatId })
            .then((response) => {
                console.log("sendMessageResponse.data:", response.data); // Check the response data

                // Emit new message event to socket server
                if (socket) {
                    socket.emit('newMessage', messageContent, receiverID, myID);
                }
            })
            .catch((error) => {
                console.error('Error sending message:', error);
            });
        //sendMessageNotification(chatId,receiverID)

        setMessageContent('');
    };

    useEffect(() => {
        if (socket) {
            const handleMessageReceived = (newMessage) => {
                console.log('messageReceived', newMessage);
                setAllMessages(prevMessages => [...prevMessages, newMessage]);
            };

            socket.on('messageReceived', handleMessageReceived);

            return () => {
                socket.off('messageReceived', handleMessageReceived);
            };
        }
    }, [socket]); // Ensuring this runs only when `socket` changes


    useEffect(() => {
        axios.get("http://localhost:3000/getChats")
            .then(response => {
                console.log("Conversations", response.data)
                setConversations(response.data)
                const receiverID = response.data[0].users[1]._id
                setReceiverID(chatId, receiverID)
                console.log("recevierID", receiverID)

            })


    }, [])


    useEffect(() => {
        axios.get("http://localhost:3000/getGroupData/" + chatId)
            .then(response => {
                console.log("GroupData:", response.data)
                setGroupUsers(response.data)
            })

    }, [chatId])




    const handleDeleteChat = () => {
        axios.delete("http://localhost:3000/deleteChat/" + chatId)
            .then(response => {
                if (response.status === 403) {
                    toast.error('You are not authorized to delete this chat.', { position: 'top-center' });
                } else if (response.status === 200) {
                    console.log("DeleteChat", response);
                    toast.success('Chat deleted successfully.', { position: 'top-center' });
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Error deleting chat:', error);
                toast.error('You are not authorized to delete this chat.', { position: 'top-center' });
            });
    };


    const sendMessageNotification = (chatId, receiverId) => {
        axios.post('http://localhost:3000/messageNotification', { chatId, receiverId })
            .then(response => {
                console.log("message.Notification response:", response.data);
            })
            .catch(error => {
                console.error("Error sending message notification:", error);
            });
    };


    const removeUserFromGroup = (userID) => {
        console.log("RemoveID : ", userID);
        axios.put(`http://localhost:3000/removeUserFromGroup/${chatId}`, { userID })
            .then(response => {
                console.log("userRemovedFromGroup", response.data);
                setGroupUsers(prevState => ({
                    ...prevState,
                    users: prevState.users.filter(user => user._id !== userID)

                }))
                toast.success('User removed.', { position: 'top-center' });

            })
            .catch(error => {
                console.error("Error removing user from group", error);
            });

    }



    const makeAdmin = (userID) => {
        console.log("MakeAdmin : ", userID);
        axios.put(`http://localhost:3000/makeAdmin/${chatId}`, { userID })
            .then(response => {
                console.log("MakeAdmin", response);

            })
            .catch(error => {
                console.error("Error making user a admin", error);
            });
        toast.success('Admin Added.', { position: 'top-center' });

    }

    const banUserFromGroup = (userID) => {
        console.log("banUserID : ", userID);
        axios.put(`http://localhost:3000/banUserFromGroup/${chatId}`, { userID })
            .then(response => {
                console.log("BanUserId", response.data);
                setGroupUsers(prevState => ({
                    ...prevState,
                    users: prevState.users.filter(user => user._id !== userID)
                }));
                toast.success('User Banned.', { position: 'top-center' });
            })
            .catch(error => {
                console.error("Error banning user", error);
                if (error.response && error.response.data && error.response.data.msg) {
                    const errorMessage = error.response.data.msg;
                    toast.error(errorMessage, { position: 'top-center' });
                } else {
                    toast.error('An error occurred while banning the user.', { position: 'top-center' });
                }
            });
    };


    const unBannedFromGroup = (userID) => {
        console.log("unBanID : ", userID);

        // Ensure `chatId` is defined and accessible here
        axios.put(`http://localhost:3000/unBanUserFromGroup/${chatId}`, { userID })
            .then(response => {
                console.log("unBanID", response.data);
                toast.success('Ban removed.', { position: 'top-center' });
                // Update local state to remove the user from the list instead of reloading the page
                setGroupUsers(prevState => ({
                    ...prevState,
                    bannedFromGroup: prevState.bannedFromGroup.filter(user => user._id !== userID)
                }));
            })

            .catch(error => {
                console.error("Error making unban a user", error);
                toast.error('Error unbanning user.', { position: 'top-center' });
            });
    }

    const exitFromTheGroup = () => {
        axios.put(`http://localhost:3000/exitFromTheGroup/${chatId}`)
        .then(response => {
            console.log("ExitGroupResponse" , response)
             if(response.status === 200) {
             toast.success('You left the group.', { position: 'top-center' });
             navigate('/messages')
            }
        })

    }



    return (
        <div className='cheatArea-container'>


            <div className={'chatArea-header' + (lightTheme ? '' : ' dark')}>

                <p>{chatName}</p>


                {groupUsers && groupUsers.groupAdmin && groupUsers.groupAdmin.some(admin => admin._id === loggedUserInformation.id) && (
                    <div>
                        <IconButton onClick={() => setShowBannedUsersList(true)}>
                            <BlockIcon />
                        </IconButton>
                    </div>
                )}
                {showBannedUsersList && (
                    <>
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowBannedUsersList(false)}></div>
                        <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center overflow-y-scroll">
                            <p className='font-bold text-xl'>Banned Users</p>
                            {groupUsers && groupUsers.bannedFromGroup && groupUsers.bannedFromGroup.map(user => (
                                <div key={user._id} className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <img src={user.ProfilPhoto ? `http://localhost:3000/Images/${user.ProfilPhoto}` : blankPP} className="w-10 h-10 rounded-full mr-2" />
                                        <p>{user.username}</p>
                                        <button onClick={() => unBannedFromGroup(user._id)} className='ml-10 bg-blue-500'>Unban</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}



                <div className='hover:opacity-70'>
                    <IconButton onClick={() => setShowConfirmationDialog(true)}>
                        <DeleteIcon className={'' + (lightTheme ? '' : ' dark')} />
                    </IconButton>

                </div>

                <div>

                    {groupUsers && groupUsers.isGroupChat && groupUsers.isGroupChat ? (
                        <>
                            <IconButton onClick={() => { setShowGroupUsersList(true); }}>
                                <PeopleOutlineIcon titleAccess='GroupUsers' />
                            </IconButton>


                            <IconButton onClick={() =>exitFromTheGroup()}>
                                <ExitToApp className={"icon" + ((lightTheme) ? "" : " dark")} titleAccess="Exit Group" />
                            </IconButton>


                        </>
                    ) : <></>}


                    {showGroupUsersList && (
                        <>
                            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowGroupUsersList(false)}></div>
                            <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center overflow-y-scroll">
                                <p className='font-bold text-xl mb-4'>Group Users</p>
                                {groupUsers && groupUsers.users && groupUsers.users.map(user => (
                                    <div key={user._id} className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <img src={user.ProfilPhoto ? `http://localhost:3000/Images/${user.ProfilPhoto}` : blankPP} className="w-10 h-10 rounded-full mr-2" />
                                            <div onClick={() => navigate(`/profile/${user._id}`)} className='w-[60px] cursor-pointer'>{user.username}</div>

                                        </div>
                                        {groupUsers.groupAdmin && groupUsers.groupAdmin.some(admin => admin._id === user._id) && (
                                            <span className="ml-2 text-sm font-semibold hover:text-primary cursor-pointer"> Admin</span>
                                        )}

                                        {groupUsers.groupAdmin && groupUsers.groupAdmin.some(admin => admin._id === loggedUserInformation.id) && (
                                            <button onClick={() => { setShowGroupUsersOptions(true); setSelectedUserId(user._id); }} className="ml-2 text-sm font-semibold hover:text-primary cursor-pointer">...</button>
                                        )}
                                        <div className="flex items-center">



                                            {showGroupUsersOptions && (
                                                <>
                                                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowGroupUsersOptions(false)}></div>

                                                    <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center ">
                                                        <h1 className='font-bold p-5'>Group Users Settings</h1>
                                                        <div className='flex flex-col justify-between items-center h-[50px]'>
                                                            <button onClick={() => makeAdmin(selectedUserId)} className='cursor-pointer hover:opacity-80 hover:text-primary'>Make Admin</button>

                                                            <button className=' cursor-pointer hover:text-red-600' onClick={() => { removeUserFromGroup(selectedUserId); setShowGroupUsersOptions(false); }}>Remove</button>
                                                            <button onClick={() => banUserFromGroup(selectedUserId)} className=' cursor-pointer hover:text-red-600'>Ban</button>
                                                        </div>
                                                    </div>
                                                </>


                                            )}



                                        </div>

                                    </div>
                                ))}
                            </div>
                        </>
                    )}



                </div>


            </div>

            {showConfirmationDialog && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowConfirmationDialog(false)}></div>
                    <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-lg font-medium mb-4">Are you sure you want to delete this chat? If you delete the chat, it will be deleted from both sides</p>
                        <div className="flex justify-around">
                            <button className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-900 transition-colors" onClick={handleDeleteChat}>Yes</button>
                            <button className="px-4 py-2 bg-red-500 rounded hover:bg-red-700 transition-colors" onClick={() => setShowConfirmationDialog(false)}>No</button>
                        </div>
                    </div>
                </>
            )}


            <div className={'messages-contianer' + (lightTheme ? '' : ' dark')}>
                Message Container
                {allMessages &&
                    allMessages.map((message, index) => {
                        const sender = message.sender;
                        const self_id = loggedUserInformation.id;
                        if (sender && sender._id === self_id) {
                            return <MessageSelf props={message} key={index} />;
                        } else {
                            return <MessageOthers props={message} key={index} />;
                        }
                    })}
            </div>
            <div className={'text-input-area' + (lightTheme ? '' : ' dark')}>
                <input
                    placeholder='Type a Message'
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(event) => {
                        if (event.code === 'Enter') {
                            sendMessage();
                            sendMessageNotification(chatId, receiverID)
                            setMessageContent('');
                        }
                    }}
                    className={'search-box' + (lightTheme ? '' : ' dark')}
                />
                <div className='hover:opacity-80 flex justify-center'>
                    <IconButton onClick={sendMessage}>
                        <SendIcon />
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default ChatArea;
