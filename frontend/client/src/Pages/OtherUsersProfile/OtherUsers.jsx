import FeederNav from "../../FeederNav/FeederNav"
import { useContext, useEffect, useState } from "react";
import { userContext } from '../../App'
import axios from "axios";
import portraitPhoto from "../../assets/images/Portait_Photo.jpg"
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";






const OtherUsers = () => {

    const loggedUserInformation = useContext(userContext)
    const { id } = useParams()
    const [commentTexts, setCommentTexts] = useState({});
    const [isFollow, setIsFollow] = useState(false);
    const [userProfilePost, setuserProfilePost] = useState([])
    const [userProfileInformation, setUserProfileInformation] = useState([])

    const navigate = useNavigate()

    useEffect(() => {
        axios.get("http://localhost:3000/userProfile/" + id)
            .then(response => {
                console.log(response)
                const userProfilePostData = response.data.postsOfUser;
                const userProfileInfoData = response.data.user
                setUserProfileInformation(userProfileInfoData)
                setuserProfilePost(userProfilePostData)

                if (userProfileInfoData.followers.includes(loggedUserInformation._id)) {
                    setIsFollow(true)
                }


            }).catch(err => console.log(err));

    }, [isFollow]);


    const [likeInProgress, setLikeInProgress] = useState(false)

    const handleLikeToggle = (postId) => {
        const postIndex = userProfilePost.findIndex(post => post._id === postId);
        const updatedPosts = [...userProfilePost];
        updatedPosts[postIndex] = { ...updatedPosts[postIndex] };

        if (!likeInProgress) {
            setLikeInProgress(true);
            if (updatedPosts[postIndex].likes.includes(loggedUserInformation._id)) {
                axios.put('http://localhost:3000/unlike', { postId })
                    .then(response => {
                        updatedPosts[postIndex].likes = updatedPosts[postIndex].likes.filter(userId => userId !== loggedUserInformation._id);
                        // Toggle the likedByCurrentUser flag here for unlike action
                        updatedPosts[postIndex].likedByCurrentUser = false;
                        setuserProfilePost(updatedPosts);
                        setLikeInProgress(false);
                    }).catch(error => {
                        console.log(error);
                        setLikeInProgress(false);
                    });
            } else {
                axios.put('http://localhost:3000/like', { postId })
                    .then(response => {
                        updatedPosts[postIndex].likes.push(loggedUserInformation._id);
                        // Toggle the likedByCurrentUser flag here for like action
                        updatedPosts[postIndex].likedByCurrentUser = true;
                        setuserProfilePost(updatedPosts);
                        setLikeInProgress(false);
                    })
                    .catch(error => {
                        console.log(error);
                        setLikeInProgress(false);
                    });
            }
        }
    };


    const handleFollow = (followId) => {
        axios.put('http://localhost:3000/follow', { followId })
            .then(result => {
                console.log(result)
                setIsFollow(true)
            })

    }
    const handleUnFollow = (followId) => {
        axios.put('http://localhost:3000/unfollow', { followId }) // Assuming you create a new endpoint '/unfollow' for unfollowing a user
            .then(result => {
                console.log(result);
                setIsFollow(false);
            })
            .catch(error => {
                console.log(error);
            });
    }

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


    const handleViewAllComments = (postId) => {
        navigate(`/post/${postId}`);
    };


    /*
      const handleFollowAndUnFollow = (followId) => {
      
          if(userProfileInformation.)
  
  
      }
  */
    const isVideo = (filename) => {
        const videoExtensions = ['.mp4', '.mov', '.avi']; // Add more if needed
        const ext = filename.split('.').pop();
        return videoExtensions.includes(`.${ext}`);
    };


    return (
        <div className="">
            <FeederNav></FeederNav>


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
                                }
                            }}
                            className="text-sm px-2 py-1 ml-2 bg-primary hover:opacity-80 text-white rounded-md"
                        >
                            {isFollow ? "unfollow" : "follow"}
                        </button>


                    </div>


                </div>
                <div className="flex flex-col md:flex-row items-center"> {/* Container for photo and profile data */}

                    <img src={`http://localhost:3000/Images/${userProfileInformation.ProfilPhoto}`}
                        className="w-32 h-32 rounded-full mb-4 md:mr-8" alt="Profile" /> {/* Profile photo */}

                    <div className="grid grid-cols-3 gap-4 text-center"> {/* Profile data */}
                        <div>
                            <p className="text-lg font-semibold">{userProfilePost.length}</p>
                            <p className="text-sm">Posts</p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">{userProfileInformation.followers && userProfileInformation.followers.length}</p>
                            <p className="text-sm">Followers</p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold"> {userProfileInformation.following && userProfileInformation.following.length} </p>
                            <p className="text-sm">Following</p>
                        </div>
                    </div>
                </div>

                {/* Additional content can be added here */}
            </div>

            <div className="text-center border-b border-gray-300"> {/* About Me section */}
                <h2 className="text-xl font-bold mb-2">About Me</h2>
                <p className="text-sm">{userProfileInformation.aboutMe}</p>

            </div>


            <div>
                {
                    userProfileInformation.followers && userProfileInformation.followers.includes(loggedUserInformation.id) ?

                        <>

                            <div className="flex flex-wrap justify-center">
                                {userProfilePost && userProfilePost.map(postOfUser => (
                                    <div key={postOfUser._id} className="bg-wihte rounded-lg overflow-hidden shadow-2xl m-10 border-b border-gray-700 max-w-[500px]">

                                        <div className="flex items-center p-2">
                                            <img
                                                src={`http://localhost:3000/Images/${postOfUser.postedBy.ProfilPhoto}`}
                                                className="w-10 h-10 rounded-full mr-2 mb-2"
                                                alt="Profile"
                                            />
                                            <p className="font-bold text-xl cursor-pointer">{postOfUser.postedBy.username}</p>
                                        </div>
                                        {postOfUser.file && isVideo(postOfUser.file) ? (
                                            <video controls className="w-full h-auto object-cover">
                                                <source src={`http://localhost:3000/Videos/${postOfUser.file}`} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (

                                            <Link to={`/post/${postOfUser._id}`}>
                                                <img src={`http://localhost:3000/Images/${postOfUser.file}`} alt={postOfUser.title || 'Post'} className="w-full h-auto object-cover" />
                                            </Link>

                                        )}




                                        <div className="ml-4 flex items-center">
                                            <h2> {postOfUser.likes && postOfUser.likes.length} likes </h2>
                                        </div>
                                        <div className="p-2">
                                            <h2 className="truncate text-sm font-semibold text-gray-900">{postOfUser.title}</h2>
                                            <p className="text-xs text-gray-700">{postOfUser.description}</p>
                                            <div className="flex mt-2">

                                                <span onClick={() => handleLikeToggle(postOfUser._id)}
                                                    className={`cursor-pointer material-symbols-outlined ${postOfUser.likedByCurrentUser ? 'text-green-500' : ''}`}>
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

                        </> : <div>
                            <h1 className="text-primary font-bold text-center mt-4"> You need follow user to see posts </h1>
                            <div className="flex justify-center items-center mt-20">
                                <span className="material-symbols-outlined text-7xl">
                                    Lock
                                </span>
                            </div>


                        </div>

                }

            </div>











        </div >
    )
}

export default OtherUsers