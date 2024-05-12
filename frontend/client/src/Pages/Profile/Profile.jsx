import FeederNav from "../../FeederNav/FeederNav"
import { useContext, useEffect, useState } from "react";
import { userContext } from '../../App'
import axios from "axios";
import portraitPhoto from "../../assets/images/Portait_Photo.jpg"
import { Link, useNavigate, useParams } from "react-router-dom";
import blankPP from "../../assets/images/blankPP.jpeg"
import io from 'socket.io-client';
import { toast } from "react-toastify";
import { MdBlock } from "react-icons/md";
import { MdOutlineReport } from "react-icons/md";
import { MdPrivacyTip } from "react-icons/md";


const Profile = () => {

    const userInformation = useContext(userContext)
    const navigate = useNavigate()
    const [myposts, setMyPosts] = useState([])
    const [commentTexts, setCommentTexts] = useState({});
    const [myProfileInfos, setMyProfileInfo] = useState([])
    const [notificationss, setNotifications] = useState([]);
    const [userProfilePost, setuserProfilePost] = useState([])
    const [userProfileInformation, setUserProfileInformation] = useState([])
    const { id } = useParams()
    const [isFollow, setIsFollow] = useState(false);
    const [isProfileLocked, setIsProfileLocked] = useState(false);
    const [socket, setSocket] = useState(null);
    const [followStatus, setFollowStatus] = useState('Follow')
    const [showFollowersList, setShowFollowersList] = useState(false);
    const [showFollowingList, setShowFollowingList] = useState(false);
    const [showFollowersListForOther, setShowFollowersListForOther] = useState(false);
    const [showFollowingListForOther, setShowFollowingListForOther] = useState(false);
    const [showOptionsList, setShowOptionList] = useState(false);
    const [myBlockedUsers, setmyBlockedUsers] = useState([])
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        // You can listen for events only after socket is initialized
        if (newSocket) {
            newSocket.on("firstevent", (msg) => {
                console.log(msg);
            });
        }

        // Clean up socket on component unmount

    }, []);


    useEffect(() => {
        axios.get("http://localhost:3000/userProfile/" + id)
            .then(response => {
                console.log(response)
                const userProfilePostData = response.data.postsOfUser;
                const userProfileInfoData = response.data.user
                setUserProfileInformation(userProfileInfoData)
                setuserProfilePost(userProfilePostData)
                const isProfileLockedInfo = response.data.user.profileLocked
                setIsProfileLocked(isProfileLockedInfo)
                if (userProfileInfoData.followers.some(users => users._id === userInformation.id)) {
                    setIsFollow(true)
                    setFollowStatus('Following')

                } else if (userProfileInfoData.followRequests.includes(userInformation.id)) {
                    setFollowStatus('Requested')
                } else {
                    setIsFollow(false)
                    setFollowStatus('Follow')
                }

                if (userProfileInfoData.blockedUsers.includes(userInformation.id)) {
                    setErrorMessage("You are not allowed to view this profile.");
                }


            }).catch(err => console.log(err));

    }, [isFollow, id, userInformation.id]);


    useEffect(() => {
        axios.get(`http://localhost:3000/myposts/${id}`)
            .then(response => {
                const myProfileInfo = response.data.user // this info has followers and following array rather than loggedUserInfo
                const updatedPosts = response.data.myposts.map(post => ({
                    ...post,
                    likedByCurrentUser: post.likes.includes(userInformation.id), // Add this line
                }));


                setMyProfileInfo(myProfileInfo)
                setMyPosts(updatedPosts);
                console.log(response)
                console.log(updatedPosts)
                console.log(myProfileInfo.ProfilPhoto)
            }).catch(err => console.log(err));

    }, []);





    const [likeInProgress, setLikeInProgress] = useState(false)

    const handleLikeToggle = (postId) => {
        const postIndex = myposts.findIndex(post => post._id === postId);
        const updatedPosts = [...myposts];
        updatedPosts[postIndex] = { ...updatedPosts[postIndex] };


        const postIndexOfotherUSer = userProfilePost.findIndex(post => post._id === postId);
        const updatedOthersPost = [...userProfilePost];
        updatedOthersPost[postIndexOfotherUSer] = { ...updatedOthersPost[postIndexOfotherUSer] }


        if (!likeInProgress) {
            setLikeInProgress(true);
            if (updatedPosts[postIndex].likes.includes(userInformation.id) || updatedOthersPost[postIndexOfotherUSer].likes.includes(userInformation.id)) {
                axios.put('http://localhost:3000/unlike', { postId })
                    .then(response => {
                        updatedPosts[postIndex].likes = updatedPosts[postIndex].likes.filter(userId => userId !== userInformation.id);
                        // Toggle the likedByCurrentUser flag here for unlike action
                        updatedPosts[postIndex].likedByCurrentUser = false;

                        updatedOthersPost[postIndexOfotherUSer].likes = updatedOthersPost[postIndexOfotherUSer].likes.filter(userId => userId !== userInformation.id)
                        updatedOthersPost[postIndexOfotherUSer].likedByCurrentUser = false;

                        setMyPosts(updatedPosts);
                        setuserProfilePost(updatedOthersPost)
                        setLikeInProgress(false);
                    }).catch(error => {
                        console.log(error);
                        setLikeInProgress(false);
                    });
            } else {
                axios.put('http://localhost:3000/like', { postId })
                    .then(response => {
                        updatedPosts[postIndex].likes.push(userInformation.id);
                        // Toggle the likedByCurrentUser flag here for like action
                        updatedPosts[postIndex].likedByCurrentUser = true;

                        updatedOthersPost[postIndexOfotherUSer].likes.push(userInformation.id)
                        updatedOthersPost[postIndexOfotherUSer].likedByCurrentUser = true;


                        setMyPosts(updatedPosts);
                        setuserProfilePost(updatedOthersPost)

                        setLikeInProgress(false);
                    })
                    .catch(error => {
                        console.log(error);
                        setLikeInProgress(false);
                    });
            }
        }
    };

    const handleGoToUser = () => {
        window.location.reload();
    }

    const handleViewAllComments = (postId) => {
        navigate(`/post/${postId}`);
    };


    const handleCommentChange = (postId, e) => {
        if (e && e.target) {
            const newTexts = { ...commentTexts, [postId]: e.target.value };
            console.log(newTexts)
            setCommentTexts(newTexts);
        }


    };


    const handleCommentSubmit = (postId) => {
        //console.log(`Comment for post ${postId}: ${commentText}`);
        const commentText = commentTexts[postId];
        axios.put('http://localhost:3000/comment', { commentText, postId })
            .then(response => {
                console.log(response)
            }).catch(error => {
                console.error(error);
            });
        setCommentTexts({ ...commentTexts, [postId]: '' });
    };

    // Set initial notifications state from local storage


    const isVideo = (filename) => {
        const videoExtensions = ['.mp4', '.mov', '.avi'];
        const ext = filename.split('.').pop();
        return videoExtensions.includes(`.${ext}`);
    };

    const handleFollow = (followId) => {
        axios.put('http://localhost:3000/follow', { followId })
            .then(result => {
                console.log("follow result: ", result)
                setIsFollow(true)



            })


    }
    const handleUnFollow = (followId) => {
        axios.put('http://localhost:3000/unfollow', { followId }) // Assuming you create a new endpoint '/unfollow' for unfollowing a user
            .then(result => {
                console.log(result);
                setIsFollow(false)
            })
            .catch(error => {
                console.log(error);
            });

        window.location.reload();
        toast.success('User unfollowed.', { position: 'top-center' });

    }


    useEffect(() => {
        if (socket) {
            socket.emit("newUser", userInformation.username);
        }
    }, [socket, userInformation]);





    const handleNotificationForFollowing = (type, followedUserName) => {
        const timestamp = new Date(); // Get the current timestamp
        console.log(timestamp)
        socket.emit("sendNotification", {
            senderName: userInformation.username,
            receiverName: followedUserName,
            type,
            followedUserId: userInformation.id, // Ensure that followId is being sent correctly
            timeStamp: timestamp.getTime(),
        });

    };

    const [searchUsername, setSearchUsername] = useState('');

    // Function to handle search input change
    const handleSearchInputChange = (event) => {
        setSearchUsername(event.target.value);
    };

    // Filtered followers based on search input
    const filteredFollowers = userProfileInformation && userProfileInformation.followers
        ? userProfileInformation.followers.filter(user => {
            return user.username.toLowerCase().includes(searchUsername.toLowerCase());
        })
        : [];


    const filteredFollowing = userProfileInformation && userProfileInformation.following
        ? userProfileInformation.following.filter(user => {
            return user.username.toLowerCase().includes(searchUsername.toLowerCase());
        })
        : [];

    const myProfilefilteredFollowers = myProfileInfos && myProfileInfos.followers ?
        myProfileInfos.followers.filter(users => {
            return users.username.toLowerCase().includes(searchUsername.toLowerCase());
        }) : [];


    const myProfileFilteredFollowing = myProfileInfos && myProfileInfos.following ?
        myProfileInfos.following.filter(users => {
            return users.username.toLocaleLowerCase().includes(searchUsername.toLowerCase())
        }) : [];


    // Function to handle navigation and close followers list and refresh the page
    const handleNavigateForOthersFollowersClosed = (userId) => {
        navigate(`/profile/${userId}`);
        setShowFollowersListForOther(false);
        window.location.reload();
    };

    // Function to handle navigation and close followers list and refresh the page
    const handleNavigateForOthersFollowingClosed = (userId) => {
        navigate(`/profile/${userId}`);
        setShowFollowingListForOther(false);
        window.location.reload();
    };

    // Function to handle navigation and close followers list and refresh the page
    const handleNavigateForMeFollowingClosed = userId => {
        navigate(`/profile/${userId}`);
        setShowFollowingList(false);
        window.location.reload();
    };

    const handleNavigateForMeFollowersClosed = userId => {
        navigate(`/profile/${userId}`);
        setShowFollowersList(false);
        window.location.reload();
    };


    const removeUser = (userID) => {
        axios.put('http://localhost:3000/removeUser', { userID })
            .then(response => {
                console.log(response)

            })
        window.location.reload();
        toast.success('User removed.', { position: 'top-center' });


    }

    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyUrl = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000); // Reset copy success message after 2 seconds
            })
            .catch(err => console.error('Failed to copy URL: ', err));
    };


    const blockUser = (userID) => {
        axios.put("http://localhost:3000/blockUser", { userID }) // Correct URL format
            .then(response => {
                console.log(response.data);
            }).catch(err => {
                console.log("Error", err);
            });
        window.location.reload();
        toast.success('User blocked.', { position: 'top-center' });

    }


    const unblockUser = (userID) => {
        axios.put('http://localhost:3000/unBlockUser', { userID })
            .then(response => {
                console.log(response.data)
            })
        window.location.reload();
        toast.success('User unblocked.', { position: 'top-center' });



    }


    useEffect(() => {

        axios.get('http://localhost:3000/getBlockedUsers')
            .then(response => {
                console.log(response)
                setmyBlockedUsers(response.data)
            })

    }, [showOptionsList])


    const sendClickUserIDandUsername = (userID, ClickedUsername) => {
        axios.post("http://localhost:3000/newChat", { userID: userID, username: ClickedUsername })
            .then(response => {
                console.log(response);
                navigate(`/messages/`)
            })
            .catch(error => {
                console.error("Error creating new chat:", error);
                // Handle error if needed
            });
    }


    const reportToastMessagge = () => {
        toast.success('Report sent.', { position: 'top-center' });


    }


    return (
        <div className="login-page h-screen">
            <FeederNav></FeederNav>

            {id === userInformation.id ? (

                <div>  

                    <div className="mx-auto mt-10 max-w-[600px] flex flex-col items-center"> {/*profile frame */}
                        <div className="flex items-center mb-4"> {/* Container for name and edit button */}
                            <h1 className="text-2xl font-bold mr-auto">{myProfileInfos.username}</h1> {/* Name */}

                            <Link to="/editProfile">
                                <button className="grid grid-flow-col items-center text-sm px-2 py-1 ml-2 bg-primary transition ease-in-out delay-150  hover:opacity-80 text-white rounded-md">
                                    Edit Profile
                                    <span className="ml-2 material-symbols-outlined self-center justify-self-end">settings_account_box</span>
                                </button>
                            </Link>




                        </div>
                        <div className="flex flex-col md:flex-row items-center"> {/* Container for photo and profile data */}
                            <img
                                src={myProfileInfos.ProfilPhoto ? `http://localhost:3000/Images/${myProfileInfos.ProfilPhoto}` : blankPP}
                                className="w-32 h-32 rounded-full mb-4 md:mr-8"
                                alt="Profile"
                            />



                            <div className="grid grid-cols-3 gap-4 text-center"> {/* Profile data */}
                                <div>
                                    <p className="text-lg font-semibold">{myposts.length}</p>
                                    <p className="text-sm ">Posts</p>
                                </div>

                                <div className="cursor-pointer hover:text-primary" onClick={() => setShowFollowersList(true)} >
                                    <p className="text-lg font-semibold ">{myProfileInfos.followers && myProfileInfos.followers.length}</p>
                                    <p className="text-sm ">Followers</p>

                                </div>

                                {showFollowersList && (
                                    <>
                                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFollowersList(false)}></div>
                                        <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center overflow-y-scroll">
                                            <h2 className="text-lg font-bold mb-4 text-center">Followers</h2>

                                            <input
                                                type="text"
                                                placeholder="Search by username"
                                                value={searchUsername}
                                                onChange={handleSearchInputChange}
                                                className="mb-4 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                            />

                                            {myProfilefilteredFollowers && myProfilefilteredFollowers.length > 0 ? (
                                                myProfilefilteredFollowers.map(user => (
                                                    <div key={user._id} className="flex items-center mb-2">
                                                        <img src={user.ProfilPhoto ? `http://localhost:3000/Images/${user.ProfilPhoto}` : blankPP} className="w-10 h-10 rounded-full mr-2" />
                                                        <p onClick={() => handleNavigateForMeFollowersClosed(user._id)} className="text-md ml-3 font-bold cursor-pointer">{user.username}</p>
                                                        <div className="flex ml-8">

                                                            <button onClick={() => removeUser(user._id)} className="text-sm px-2 py-1 ml-2 bg-red-400 hover:opacity-80 text-white rounded-md">

                                                                Remove</button>

                                                        </div>



                                                    </div>
                                                ))
                                            ) : (
                                                <p>No followers found.</p>
                                            )}
                                        </div>
                                    </>
                                )}



                                {showFollowingList && (
                                    <>
                                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFollowingList(false)}></div>
                                        <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center overflow-y-scroll ">
                                            <h2 className=" text-lg font-bold mb-4 text-center">Following</h2>

                                            <input
                                                type="text"
                                                placeholder="Search by username"
                                                value={searchUsername}
                                                onChange={handleSearchInputChange}
                                                className="mb-4 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                            />

                                            {myProfileFilteredFollowing && myProfileFilteredFollowing.length > 0 ? (
                                                myProfileFilteredFollowing.map(user => (
                                                    <div key={user._id} className="flex items-center mb-2">
                                                        <img src={user.ProfilPhoto ? `http://localhost:3000/Images/${user.ProfilPhoto}` : blankPP} className="w-10 h-10 rounded-full mr-2" />
                                                        <p onClick={() => handleNavigateForMeFollowingClosed(user._id)} className="text-md ml-3 font-bold cursor-pointer">{user.username}</p>
                                                        <div className="flex ml-8">

                                                            <button onClick={() => handleUnFollow(user._id)} className="text-sm px-2 py-1 ml-2 bg-red-400 hover:bg-red-700 text-white rounded-md">

                                                                Unfollow</button>

                                                        </div>

                                                    </div>

                                                ))
                                            ) : (
                                                <p>No followers found.</p>
                                            )}
                                        </div>
                                    </>
                                )}




                                <div className="cursor-pointer hover:text-primary" onClick={() => setShowFollowingList(true)}>
                                    <p className="text-lg font-semibold">{myProfileInfos.following && myProfileInfos.following.length}</p>
                                    <p className="text-sm">Following</p>
                                </div>
                            </div>
                        </div>




                        {/* Additional content can be added here */}
                    </div>

                    <div className="text-center border-b border-gray-300"> {/* About Me section */}
                        <h2 className="text-xl font-bold mb-2 mt-2">About Me</h2>
                        <p className="text-sm">{myProfileInfos.aboutMe}</p>
                    </div>


                    <div className="flex flex-col max-w-[520px] mx-auto justify-center">
                        {myposts && myposts.map(postOfRg => (
                            <div key={postOfRg._id} className="bg-white rounded-lg overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] m-10 border-b h-[700px] min-w-[400px]">
                                <div className="flex items-center p-2 min-w-[400px] max-h-[600px] object-cover">
                                    <img src={myProfileInfos.ProfilPhoto ? `http://localhost:3000/Images/${myProfileInfos.ProfilPhoto}` : blankPP} className="w-10 h-10 rounded-full mr-2" />
                                    <p onClick={handleGoToUser} className="font-bold text-xl cursor-pointer">{postOfRg.postedBy.username}</p>
                                </div>
                                <div className="flex justify-center overflow-hidden items-center w-auto min-h-[420px] object-cover">
                                <Link to={`/post/${postOfRg._id}`} className=" flex justify-center overflow-hidden items-center ">
                                    {isVideo(postOfRg.file) ? (
                                        <video controls className="object-cover ">
                                            <source src={`http://localhost:3000/Videos/${postOfRg.file}`} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <img src={`http://localhost:3000/Images/${postOfRg.file}`} alt={postOfRg.title || 'Post'} className=" object-cover " />
                                    )}
                                </Link>
                                </div>
                                <div className="ml-4 flex items-center">
                                    <h2> {postOfRg.likes && postOfRg.likes.length} likes </h2>
                                </div>
                                <div className="p-2">
                                    <h2 className="truncate text-sm font-semibold text-gray-900">{postOfRg.title}</h2>
                                    <p className="text-xs text-gray-700">{postOfRg.description}</p>
                                    <div className="flex mt-2">
                                        <span onClick={() => handleLikeToggle(postOfRg._id)} className={`cursor-pointer material-symbols-outlined ${postOfRg.likedByCurrentUser || postOfRg.likes.includes(userInformation.id) ? 'text-green-500' : ''}`}>
                                            thumb_up
                                        </span>
                                        <span onClick={() => handleViewAllComments(postOfRg._id)} className="cursor-pointer ml-2 material-symbols-outlined">
                                            chat_bubble
                                        </span>
                                    </div>
                                    <button className="text-sm text-gray-500 mt-2 mb-2" onClick={() => handleViewAllComments(postOfRg._id)}>
                                        {postOfRg.comments && postOfRg.comments.length > 0 ? `View All ${postOfRg.comments.length} Comments` : "No Comments"}
                                    </button>
                                    <div>
                                        <input
                                            className="w-full"
                                            type="text"
                                            placeholder="Add a comment..."
                                            value={commentTexts[postOfRg._id] || ''}
                                            onChange={(e) => handleCommentChange(postOfRg._id, e)}

                                        />
                                        {commentTexts[postOfRg._id]?.trim() && <button className="bg-primary font-bold text-white w-10 mt-3" onClick={() => handleCommentSubmit(postOfRg._id)}>Post</button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>






                </div>


            ) :


                <div className="m">
                    <div>
                        {errorMessage ? (
                            <div className="font-bold text-center mt-20 text-3xl">
                                <p className="text-red-600">{errorMessage}</p>
                                <p className="mt-4">Why?</p>
                                <button className="mt-5 underline text-primary">Read Our Privacy Policy</button>
                                <div className="mt-2 flex justify-center">
                                    <MdPrivacyTip className="text-green-800 size-20" />
                                </div>                        </div>

                        ) : (
                            <>
                                {/* Render the user profile here */}

                                <div className="mx-auto mt-10 max-w-[600px] flex flex-col items-center"> {/*profile frame */}
                                    <div className="flex items-center mb-4"> {/* Container for name and edit button */}
                                        <h1 className="text-2xl font-bold mr-auto">{userProfileInformation.username}</h1> {/* Name */}

                                        <div className="ml-3">
                                            <button
                                                onClick={() => {
                                                    if (isFollow) {
                                                        handleUnFollow(userProfileInformation._id);
                                                    } else {
                                                        handleFollow(userProfileInformation._id);
                                                        if (!userProfileInformation.followers.some(users => users._id === userInformation.id)) {
                                                            handleNotificationForFollowing(3, userProfileInformation.username);
                                                            setFollowStatus('Requested')
                                                        }


                                                    }
                                                }}
                                                className="text-sm px-2 py-1 ml-2 bg-primary text-white rounded-md hover:opacity-80"
                                            >
                                                {followStatus}

                                            </button>

                                        </div>

                                        <button onClick={() => sendClickUserIDandUsername(userProfileInformation._id, userProfileInformation.username)} className="text-sm px-2 py-1 ml-2 bg-primary hover:opacity-80 text-white rounded-md">Message</button>
                                        <button onClick={() => setShowOptionList(true)} title="Options"
                                            className="text-sm px-2 py-1 ml-2 bg-primary text-white rounded-md hover:opacity-80"> . . . </button>

                                        {showOptionsList && (
                                            <>
                                                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowOptionList(false)}></div>
                                                <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center">
                                                    <h2 className="text-lg font-bold mb-4 text-center">Options</h2>
                                                    <div className="border-b border-gray-300 py-2">
                                                        {myBlockedUsers.some(users => users._id === id) ? (
                                                            <p onClick={() => unblockUser(id)} className="text-red-600 font-bold text-xl cursor-pointer">
                                                                Unblock <MdBlock className="inline size-8" />
                                                            </p>

                                                        ) : (
                                                            <p onClick={() => blockUser(id)} className="text-red-600 font-bold text-xl cursor-pointer">
                                                                Block <MdBlock className="inline size-8" />
                                                            </p>
                                                        )}

                                                    </div>
                                                    <div className="border-b border-gray-300 py-2">
                                                        <p onClick={() => reportToastMessagge()}className="text-red-600 font-bold text-xl cursor-pointer">Report <MdOutlineReport className="inline size-8" /></p>
                                                    </div>
                                                    <div className="border-b border-gray-300 py-2">
                                                        <button className="text-black-600 font-bold" onClick={handleCopyUrl}>
                                                            Share Account
                                                        </button>
                                                        {copySuccess && <span className="text-green-700 ml-2 text-xl fond-bold">URL copied!</span>}
                                                    </div>
                                                </div>
                                            </>
                                        )}



                                    </div>


                                    <div className="flex flex-col md:flex-row items-center"> {/* Container for photo and profile data */}

                                        <img src={userProfileInformation.ProfilPhoto ? `http://localhost:3000/Images/${userProfileInformation.ProfilPhoto}` : blankPP}
                                            className="w-32 h-32 rounded-full mb-4 md:mr-8" alt="Profile" /> {/* Profile photo */}

                                        <div className="grid grid-cols-3 gap-4 text-center"> {/* Profile data */}
                                            <div>
                                                <p className="text-lg font-semibold">{userProfilePost.length}</p>
                                                <p className="text-sm">Posts</p>
                                            </div>
                                            <div className="cursor-pointer" onClick={() => setShowFollowersListForOther(true)}>
                                                <p className="text-lg font-semibold">{userProfileInformation.followers && userProfileInformation.followers.length}</p>
                                                <p className="text-sm ">Followers</p>
                                            </div>

                                            {userProfileInformation.profileLocked && !userProfileInformation.followers?.some(users => users._id === userInformation.id) ? null : (
                                                showFollowersListForOther && (
                                                    <>
                                                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFollowersListForOther(false)}></div>
                                                        <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center">
                                                            <h2 className="text-lg font-bold mb-4 text-center">Followers</h2>
                                                            {/* Search input field */}
                                                            <input
                                                                type="text"
                                                                placeholder="Search by username"
                                                                value={searchUsername}
                                                                onChange={handleSearchInputChange}
                                                                className="mb-4 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                            />
                                                            {/* Display filtered followers */}
                                                            {filteredFollowers && filteredFollowers.map(user => (
                                                                <div key={user._id} className="flex items-center mb-2">
                                                                    <img src={user.ProfilPhoto ? `http://localhost:3000/Images/${user.ProfilPhoto}` : blankPP} className="w-10 h-10 rounded-full mr-2" />
                                                                    <p onClick={() => { handleNavigateForOthersFollowersClosed(user._id) }} className="text-md ml-3 font-bold cursor-pointer">{user.username}</p>

                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )
                                            )}



                                            {userProfileInformation.profileLocked && !userProfileInformation.followers?.some(users => users._id === userInformation.id) ? null : (
                                                showFollowingListForOther && (
                                                    <>
                                                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowFollowingListForOther(false)}></div>
                                                        <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center">
                                                            <h2 className="text-lg font-bold mb-4 text-center">Following</h2>
                                                            {/* Search input field */}
                                                            <input
                                                                type="text"
                                                                placeholder="Search by username"
                                                                value={searchUsername}
                                                                onChange={handleSearchInputChange}
                                                                className="mb-4 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                                            />
                                                            {/* Display filtered followers */}
                                                            {filteredFollowing && filteredFollowing.map(user => (
                                                                <div key={user._id} className="flex items-center mb-2">
                                                                    <img src={user.ProfilPhoto ? `http://localhost:3000/Images/${user.ProfilPhoto}` : blankPP} className="w-10 h-10 rounded-full mr-2" />
                                                                    <p onClick={() => { handleNavigateForOthersFollowingClosed(user._id) }} className="text-md ml-3 font-bold cursor-pointer">{user.username}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )
                                            )}



                                            <div className="cursor-pointer" onClick={() => setShowFollowingListForOther(true)}>
                                                <p className="text-lg font-semibold"> {userProfileInformation.following && userProfileInformation.following.length} </p>
                                                <p className="text-sm cursor-pointer">Following</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional content can be added here */}
                                </div>

                                <div className="text-center border-b border-gray-300"> {/* About Me section */}
                                    <h2 className="text-xl font-bold mb-2">About Me</h2>
                                    <p className="text-sm">{userProfileInformation.aboutMe}</p>

                                </div>


                                <>
                                    {userProfileInformation.profileLocked && !userProfileInformation.followers.some(user => user._id === userInformation.id) ? (

                                        <div>
                                            <h1 className="text-primary text-xl font-bold text-center mt-4"> This profile is locked. </h1>
                                            <h2 className="text-primary font-bold text-center mt-4">Follow to see their photos and videos</h2>
                                            <div className="flex justify-center items-center mt-20">
                                                <span className="material-symbols-outlined text-7xl">Lock</span>
                                            </div>
                                        </div>


                                    ) : <>

                                        <div className="flex flex-wrap justify-center">
                                            {userProfilePost && userProfilePost.map(postOfUser => (
                                                <div key={postOfUser._id} className="bg-white rounded-lg overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]  m-10  max-w-[400px] max-h-[400px]">

                                                    <div className="flex items-center p-2">
                                                      

                                                    {postOfUser.file && isVideo(postOfUser.file) ? (
                                                        <video controls className="w-[400px] h-[400px]  object-cover">
                                                            <source src={`http://localhost:3000/Videos/${postOfUser.file}`} type="video/mp4" />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    ) : (

                                                        
                                                
                                                        <Link to={`/post/${postOfUser._id}`}>
                                                            <img src={`http://localhost:3000/Images/${postOfUser.file}`} alt={postOfUser.title || 'Post'} className="w-[400px] h-[400px] object-cover" />
                                                        </Link>

                                                    )}

                                                    </div>




                                                    <div className="ml-4 flex items-center">
                                                        <h2> {postOfUser.likes && postOfUser.likes.length} likes </h2>
                                                    </div>
                                                    <div className="p-2">
                                                        <h2 className="truncate text-sm font-semibold text-gray-900">{postOfUser.title}</h2>
                                                        <p className="text-xs text-gray-700">{postOfUser.description}</p>
                                                        <div className="flex mt-2">

                                                            <span onClick={() => handleLikeToggle(postOfUser._id)}
                                                                className={`cursor-pointer material-symbols-outlined ${postOfUser.likes.includes(userInformation.id) ? 'text-green-500' : ''}`}>
                                                                thumb_up
                                                            </span>


                                                            <span onClick={() => handleViewAllComments(postOfUser._id)} className="cursor-pointer ml-2 material-symbols-outlined">
                                                                chat_bubble
                                                            </span>
                                                        </div>

                                                        <button className="text-sm text-gray-500 mt-2 mb-2" onClick={() => handleViewAllComments(postOfUser._id)}>
                                                            {postOfUser.comments && postOfUser.comments.length > 0 ? `View All ${postOfUser.comments.length} Comments` : "No Comments"}
                                                        </button>





                                                        <div>
                                                            <input

                                                                className="w-full"
                                                                type="text"
                                                                placeholder="Add a comment..."
                                                                value={commentTexts[postOfUser._id] || ''}
                                                                onChange={(e) => handleCommentChange(postOfUser._id, e)}

                                                            />
                                                            {/* Conditionally render submit button */}
                                                            {commentTexts[postOfUser._id]?.trim() && <button className="bg-primary font-bold text-white w-10 mt-3" onClick={() => handleCommentSubmit(postOfUser._id)}>Post</button>}
                                                        </div>
                                                    </div>
                                                </div>

                                            ))}
                                        </div>



                                    </>}



                                </> :


                                <div>



                                </div>





                            </>
                        )}
                    </div>
















                </div>}



        </div >
    )
}

export default Profile