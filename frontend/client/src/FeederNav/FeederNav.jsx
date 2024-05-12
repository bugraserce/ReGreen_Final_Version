import { Link, useNavigate } from "react-router-dom";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useContext, useEffect, useRef, useState } from "react";
import { NotificationsContext, useNotifications } from "../NotificationsContext/Notifications"; // Import NotificationsContext and useNotifications hook
import axios from "axios"
import { userContext } from "../App";
import { FaRegPlusSquare } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { LuMessagesSquare } from "react-icons/lu";
import { IoIosSearch } from "react-icons/io";
import { FaRegNewspaper } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import { CiMenuBurger } from "react-icons/ci";
import { MdOutlineRecycling } from "react-icons/md";
import test from "./regreen-logo.png"







const FeederNav = () => {

    const loggedUserInformation = useContext(userContext)

    const { notifications } = useNotifications(); // Access notifications from the context
    const [showNotifications, setShowNotifications] = useState(false);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [followRequests, setFollowRequest] = useState([]);
    const [conversations, setConversations] = useState([])
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate()




    useEffect(() => {
        axios.get("http://localhost:3000/getChats")
            .then(response => {
                console.log(response.data)
                setConversations(response.data)

            })


    }, [])




    const handleLogOut = () => {
        localStorage.setItem(`notifications_${loggedUserInformation.id}`, JSON.stringify(notifications));
        axios.get("http://localhost:3000/logout")
            .then((response) => {
                if (response.data === "Success") {
                    window.location.href = "/login";
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (value.length > 0) {
            fetchUsers(value);
            setShowSearchBox(true); // Show the search box when there is input
        } else {
            setSearchResults([]);
            setShowSearchBox(false); // Hide the search box when input is empty
        }
    };



    const fetchUsers = async (searchTextValue) => {
        try {
            const response = await axios.get(`http://localhost:3000/search-users?query=${searchTextValue}`);
            setSearchResults(response.data);
            console.log("searchResults:", response.data)

        } catch (error) {
            console.log('Error fetching search results:', error);
        }
    };

    const toggleSearchBox = () => {
        setShowSearchBox(!showSearchBox);

    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    /*
      const removeNotificationFromLocalStorage = () => {
          const notifications = JSON.parse(localStorage.getItem(`notifications_${loggedUserInformation.id}`));
          if (notifications) {
              const updatedNotifications = notifications.filter(notification => notification.type !== 3);
              localStorage.setItem(`notifications_${loggedUserInformation.id}`, JSON.stringify(updatedNotifications));
          }
      };
     */

    useEffect(() => {

        axios.get('http://localhost:3000/followRequests')
            .then(response => {
                console.log("Follow Requests:", response.data.followRequests)
                setFollowRequest(response.data.followRequests);
            })


    }, [])

    const handleAcceptFollow = (followedUserId) => {
        axios.put('http://localhost:3000/acceptfollow', { useWhoSendRequest: followedUserId, accept: true })
            .then(result => {
                console.log(result.data);
                // Optionally, you can update the UI or display a message indicating that the follow request was accepted successfully
                //removeNotificationFromLocalStorage();
                window.location.reload()



            })
            .catch(error => {
                console.error('Error accepting follow request:', error);
                // Optionally, you can handle errors or display error messages to the user
            });



    };


    const handleDeclineFollow = (followedUserId) => {
        axios.put('http://localhost:3000/declinefollow', { useWhoSendRequest: followedUserId, decline: true })
            .then(result => {
                console.log(result)

                //removeNotificationFromLocalStorage();
                window.location.reload()

            }).catch(error => {
                console.error('Error accepting follow request:', error);
                // Optionally, you can handle errors or display error messages to the user
            });

    };

    const displayNotification = ({ senderName, type, postId, postPhoto, timestamp, followedUserId }) => {
        let action;
        if (type === 1) {
            action = "liked";
        } else if (type === 2) {
            action = "commented";
        } else if (type === 3) {
            action = "follow";

        }

        // Determine if the postPhoto is an image or a video based on the file extension
        const isImage = postPhoto && postPhoto.match(/\.(jpeg|jpg|gif|png)$/) !== null;
        const isVideo = postPhoto && postPhoto.match(/\.(mp4|mov|avi|wmv)$/) !== null;




        return (
            <div className="notification-link">
                {type === 1 || type === 2 ? (
                    <Link to={`/post/${postId}`}>
                        <span>
                            {`${senderName} ${action} your post `}
                            {isImage && <img src={`http://localhost:3000/Images/${postPhoto}`} alt="Post" className="w-10 h-10" />}
                            {isVideo && (
                                <video controls className="w-10 h-10">
                                    <source src={`http://localhost:3000/Images/${postPhoto}`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">{new Date(parseInt(timestamp)).toLocaleString()}</span>
                    </Link>
                ) : (

                    <></>
                    /*
                   <div className="flex items-center justify-between">
                        <span className="cursor-pointer text-blue-500" onClick={() => navigate(`/profile/${followedUserId}`)}>
                            {`${senderName} sent ${action} request`}
                        </span>
                        <button onClick={() => handleAcceptFollow(followedUserId, type)} className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500">Accept</button>
                        <button onClick={() => handleDeclineFollow(followedUserId, type)} className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Decline</button>
                    </div>
                    
                    */
                )}
            </div>
        );
    };

    // Assuming 'conversations' is an array of conversation objects and each has a 'users' array and 'messageNotifications' array
    const hasNotificationsUSERS = conversations.map((conversation, index) => {
        // Determine the "other user" message in the conversation; assumes two users per conversation
        const otherUserID = conversation.messageNotifications.find(id => id !== loggedUserInformation.id);

        // Count notifications sent to the logged-in user by the other user
        const notificationsCount = conversation.messageNotifications.filter(id => id === otherUserID).length;

        // Conditionally render the notification count for the logged-in user
        if (notificationsCount > 0) {
            return (
                <div className="" key={conversation._id || index}>
                    {notificationsCount}
                </div>
            );
        }
        return <div key={conversation._id || index}><span></span></div>;
    });


    const goToBins = () => {
        navigate('/bins')
        window.location.reload();
    }

    const goToProfile = () => {
        navigate(`/profile/${loggedUserInformation.id}`)
        window.location.reload();
    }




    return (




        <header className="bg-primary flex w-full justify-between h-20 text-white font-bold  ">
            <div className="flex items-center justify-start transform transition duration-500 ">
                <Link className="text-2xl font-bold flex items-center justify-start    " to="/feed">
                  <img className="h-[150px] w-[150px]" src={test} alt="" />

                </Link>
            </div>
            <div className="flex items-center">
                <ul className="hidden md:flex text-md">
                    <li onClick={()=> goToProfile()} className="p-3 transform transition duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0.4,0.4,0.5)]  cursor-pointer">
                        
                            Profile
                            <div className="flex justify-center">
                                <CgProfile className=" " />
                            </div>

                       
                    </li>
                    <li className="p-3 transform transition duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0.4,0.4,0.5)] cursor-pointer">
                        <Link to="/createPost">
                            Create
                            <div className="flex justify-center">
                                <FaRegPlusSquare className="" />
                            </div>

                        </Link>{" "}
                    </li>

                    <li className="p-3 search-container transform transition duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0.4,0.4,0.5)] cursor-pointer" >
                        <button onClick={toggleSearchBox}>
                            Search
                            <div className="flex justify-center">
                                <IoIosSearch className="" />
                            </div>
                        </button>
                        {showSearchBox && (
                            <div className="absolute bg-white text-black p-2 mt-2 mr-10 shadow-xl rounded-md">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="p-1"


                                />
                                {searchResults.length > 0 && (
                                    <ul>
                                        {searchResults.map((user, index) => (
                                            <li key={index} className="py-1 px-2 hover:bg-gray-100">

                                                <button onClick={() => navigate(`/profile/${user._id}`)}>{user.username}</button>


                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </li>


                    <li className="p-3 cursor-pointer transform transition duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0.4,0.4,0.5)] ">
                        {" "}
                        <Link to="/messages/welcomeChat" >
                            Messages
                            <div className="flex justify-center">
                                <LuMessagesSquare className="" />

                                {hasNotificationsUSERS}

                            </div>
                        </Link>{" "}
                    </li>

                    <li className="p-3 cursor-pointer  transform transition duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0.4,0.4,0.5)]">
                        <button onClick={toggleNotifications} >
                            Notifications
                            <div className="flex justify-center">
                                <IoIosNotificationsOutline />
                                {notifications.length ? notifications.length : followRequests.length}

                            </div>
                        </button>

                        {showNotifications && (
                            <div className="absolute bg-white text-black p-2 mt-2 shadow-md rounded-md font-normal ">
                                {(notifications.length || followRequests.length) ? (
                                    <>
                                        {notifications.length > 0 && (
                                            notifications.map((notification, index) => (
                                                <div key={index}>{displayNotification(notification)}</div>
                                            ))
                                        )}

                                        {followRequests.length > 0 && (
                                            followRequests.map((request) => (
                                                <div key={request._id}>
                                                    <p>{request.username} sent a Follow Request</p>
                                                    <button onClick={() => handleAcceptFollow(request._id)} className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500">Accept</button>
                                                    <button onClick={() => handleDeclineFollow(request._id)} className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Decline</button>
                                                </div>
                                            ))
                                        )}
                                    </>
                                ) : (
                                    <p>No notifications</p>
                                )}
                            </div>
                        )}
                    </li>
                    <li className="p-3 cursor-pointer transform transition duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0.4,0.4,0.5)]">
                        <Link to="/news">
                            News
                            <div className="flex justify-center">
                                <FaRegNewspaper className="" />
                            </div>
                        </Link>

                    </li>

                    <li  onClick={() => goToBins()} className="p-3 cursor-pointer transform transition duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0.4,0.4,0.5)]">
                       
                            Bins
                            <div className="flex justify-center">
                                <MdOutlineRecycling/>

                            </div>
                        
                    </li>


                    <li className="p-3 cursor-pointer transform transition duration-500 hover:shadow-[0_35px_60px_-15px_rgba(0,0.4,0.4,0.5)]">
                        <input
                            type="button"
                            value="Logout"
                            className="cursor-pointer"
                            onClick={handleLogOut}
                        />{" "}

                        <div className="flex justify-center">
                            <MdOutlineLogout className="" />{" "}
                        </div>
                    </li>
                </ul>


                <div className="md:hidden flex items-center">
                    <ul className="flex space-x-4 text-white">
                        <li className="rounded-full transform transition duration-500 hover:scale-125 cursor-pointer" title="Profile" onClick={() => navigate(`/profile/${loggedUserInformation.id}`)}>
                            <CgProfile className="h-6 w-6" />
                        </li>
                        <li className="rounded-full transform transition duration-500 hover:scale-125" title="Create Post" onClick={() => navigate('/createPost')}>
                            <FaRegPlusSquare className="h-6 w-6" />
                        </li>

                        <li className="rounded-full transform transition duration-500 hover:scale-125 cursor-pointer">
                            <button onClick={toggleSearchBox}>
                                <IoIosSearch size={25} />
                            </button>
                            {showSearchBox && (
                                <div className="absolute bg-white text-black p-2 mt-2 mr-10 shadow-xl rounded-md">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={handleSearchChange}
                                        className="p-1"


                                    />
                                    {searchResults.length > 0 && (
                                        <ul>
                                            {searchResults.map((user, index) => (
                                                <li key={index} className="py-1 px-2 hover:bg-gray-100">

                                                    <button onClick={() => navigate(`/profile/${user._id}`)}>{user.username}</button>


                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </li>

                        <li className="rounded-full transform transition duration-500 hover:scale-125 cursor-pointer" title="Messages" onClick={() => navigate('/messages/welcomeChat')}>
                            <LuMessagesSquare className="h-6 w-6" />
                            {hasNotificationsUSERS}
                        </li>
                        <li className="rounded-full  transform transition duration-500 hover:scale-125 cursor-pointer" title="Notifications" onClick={toggleNotifications}>
                            <IoIosNotificationsOutline className="h-6 w-6" />
                            <div className="flex justify-center">{notifications.length ? notifications.length : followRequests.length}</div>
                        </li>
                        <li className="rounded-full  transform transition duration-500 hover:scale-125 cursor-pointer" title="News" onClick={() => navigate('/news')}>
                            <FaRegNewspaper className="h-6 w-6" />
                        </li>
                       
                        <li className="rounded-full  transform transition duration-500 hover:scale-125 cursor-pointer" title="bins" onClick={() => navigate('/news')}>

                            <MdOutlineRecycling className="h-6 w-6" />
                        </li>
                        <li className="rounded-full  transform transition duration-500 hover:scale-125 cursor-pointer" title="Logout" onClick={handleLogOut}>
                            <MdOutlineLogout className="h-6 w-6" />
                        </li>
                    </ul>
                </div>

            </div>





        </header>



    );
};

export default FeederNav;
