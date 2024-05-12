import { useContext, useEffect, useState } from "react";
import { userContext } from '../../App'
import FeederNav from "../../FeederNav/FeederNav";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import portraitPhoto from "../../assets/images/Portait_Photo.jpg"
import blankPP from "../../assets/images/blankPP.jpeg"
import io from 'socket.io-client';
import Post from "../Post/Post";
import othersGif from "../../assets/images/othersCategory.gif";
import plasticCategory from "../../assets/images/plasticCategory.png";
import paperCategory from "../../assets/images/paperCategory.png";
import glassCategory from "../../assets/images/glassCategory.png";
import allCategory from "../../assets/images/allCategory.png";

import "./Feed.css"


const Feed = () => {

  const loggedUserInformation = useContext(userContext)
  const [posts, setPosts] = useState([])
  const [commentTexts, setCommentTexts] = useState({});
  const [socket, setSocket] = useState(null);
  const [notificationsArray, setNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all'); // State for selected category
  const [myProfileInformation, setMyProfileInformation] = useState([])
  const [showLikesOfPostList, setshowLikesOfPostList] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://localhost:3000/getposts')
      .then(response => {
        console.log(response)
        const updatedPosts = response.data.map(post => ({
          ...post,
          likedByCurrentUser: post.likes.includes(loggedUserInformation._id), // if logged user id includes retrun ture
        }));

        setPosts(updatedPosts);

      }).catch(err => console.log(err));
  }, []);


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
    if (socket) {
      socket.emit("newUser", loggedUserInformation.username);
    }
  }, [socket, loggedUserInformation]);



  const handleNotification = (type, clickReceiverName, postId, postPhoto) => {
    const timestamp = new Date(); // Get the current timestamp
    console.log(timestamp);

    // Check if all parameters are defined
    if (loggedUserInformation && loggedUserInformation.username &&
      clickReceiverName && postId && postPhoto) {
      socket.emit("sendNotification", {
        senderName: loggedUserInformation.username,
        receiverName: clickReceiverName,
        type,
        postId,
        postPhoto,
        timeStamp: timestamp.getTime(),
      });
    } else {
      console.error("One or more parameters are undefined. Notification not sent.");
    }
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
    handleNotification(2);
  };

  const handleViewAllComments = (postId) => {

    navigate(`/post/${postId}`)
  };

  const handleGotoUserProfile = (userID) => {

    // console.log(userID)
    //console.log(loggedUserInformation.id)

    navigate(`/profile/${userID}`,);


  }



  useEffect(() => {
    if (socket) {
      socket.on("getNotification", data => {
        setNotifications(prevNotifications => [...prevNotifications, data]);
        const updatedNotifications = [...notificationsArray, data];
        localStorage.setItem(`notifications_${loggedUserInformation.id}`, JSON.stringify(updatedNotifications));
      });
    }
  }, [socket, notificationsArray, loggedUserInformation.id]);
  console.log(notificationsArray)



  // Function to retrieve notifications from local storage
  const getNotificationsFromLocalStorage = (userId) => {
    const storedNotifications = localStorage.getItem(`notifications_${userId}`);
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  };
  // Set initial notifications state from local storage
  useEffect(() => {
    const storedNotifications = getNotificationsFromLocalStorage(loggedUserInformation.id);
    setNotifications(storedNotifications);
  }, [loggedUserInformation.id]);



  const [likeInProgress, setLikeInProgress] = useState(false)

  const handleLikeToggle = async (postId) => {
    const postIndex = posts.findIndex(post => post._id === postId); // find the object in the array
    const updatedPosts = [...posts]; // get all posts and shallow copy 

    if (!likeInProgress) {
      setLikeInProgress(true);
      const isLiked = updatedPosts[postIndex].likes.includes(loggedUserInformation.id);

      if (isLiked) {
        // User has already liked the post, perform unlike action
        await axios.put('http://localhost:3000/unlike', { postId })
          .then(response => {
            // Remove user id from the likes array of the post
            updatedPosts[postIndex].likes = updatedPosts[postIndex].likes.filter(userId => userId !== loggedUserInformation.id);

            // Toggle the likedByCurrentUser flag here for unlike action
            updatedPosts[postIndex].likedByCurrentUser = false;
            setPosts(updatedPosts);
            setLikeInProgress(false);
          })
          .catch(error => {
            console.log(error);
            setLikeInProgress(false);
          });
      } else {
        // User has not liked the post, perform like action
        await axios.put('http://localhost:3000/like', { postId })
          .then(response => {
            // Add user id to the likes array of the post
            updatedPosts[postIndex].likes.push(loggedUserInformation.id);

            // Toggle the likedByCurrentUser flag here for like action
            updatedPosts[postIndex].likedByCurrentUser = true;
            setPosts(updatedPosts);
            setLikeInProgress(false);
            handleNotification(1);
          })
          .catch(error => {
            console.log(error);
            setLikeInProgress(false);
          });
      }
    }
  };


  const handleGotoPost = (postId) => {
    navigate(`/post/${postId}`, { state: { user: loggedUserInformation.username } });

  };



  const isVideo = (filename) => {
    const videoExtensions = ['.mp4', '.mov', '.avi']; // Add more if needed
    const ext = filename.split('.').pop();
    return videoExtensions.includes(`.${ext}`);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    axios.get("http://localhost:3000/getProfileInfo")
      .then(response => {
        console.log(response.data);
        const profileInfo = response.data.userInformation; // Use response.data instead of response
        setMyProfileInformation(profileInfo);
      });
  }, [loggedUserInformation]);

  // In your component where you're filtering the posts
  const filteredPosts = myProfileInformation && myProfileInformation.following
    ? posts.filter(post => myProfileInformation.following.includes(post && post.postedBy && post.postedBy._id))
    : [];

  console.log("myProfileInformation", myProfileInformation)

  // Filter further based on the selected category
  const categoryAndFollowersFilteredPosts = selectedCategory === 'all' ? filteredPosts : filteredPosts.filter(post => post.category === selectedCategory);





  return (
    <div className="feed-main-container">

      <div>
      <FeederNav notifications={notificationsArray} user={loggedUserInformation.username}></FeederNav>
      <section className="font-bold text-primary">Welcome {loggedUserInformation.username}</section>
      <div className="max-w-screen-lg mx-auto overflow-hidden  mt-20">

        <h1 className="text-center font-serif text-primary text-xl">Select a Material</h1>
        {/* Category buttons */}
        <div className="flex justify-center bg-pri mt-4 space-x-4 grid grid-cols-5 gap-5">

          <button
            className={`ml-2 mr-2 p-2 font-serif rounded-md ${selectedCategory === 'all' && 'bg-primary text-white'}`}
            onClick={() => handleCategoryFilter('all')}
          >
            All
            <img src={allCategory} alt="" />
          </button>
          <button
            className={`ml-2 mr-2 p-2 font-serif rounded-md ${selectedCategory === 'paper' && 'bg-primary text-white'}`}
            onClick={() => handleCategoryFilter('paper')}
          >
            Paper
            <img src={paperCategory} alt="" />
          </button>
          <button
            className={`ml-2 mr-2 p-2  font-serif rounded-md ${selectedCategory === 'glass' && 'bg-primary text-white'}`}
            onClick={() => handleCategoryFilter('glass')}
          >
            Glass
            <img src={glassCategory} alt="" />
          </button>
          <button
            className={`ml-2 mr-2 p-2 font-serif rounded-md ${selectedCategory === 'plastic' && 'bg-primary text-white'}`}
            onClick={() => handleCategoryFilter('plastic')}
          >
            Plastic
            <img src={plasticCategory} alt="" />
          </button>

          <button
            className={`ml-2 mr-2 p-2 font-serif rounded-md ${selectedCategory === 'others' && 'bg-primary text-white'}`}
            onClick={() => handleCategoryFilter('others')}
          >
            Others
            <img src={othersGif} alt="" />
          </button>
        </div>


      </div>
      
      </div>
      

      <div className="max-w-[500px] mx-auto min-h-[900px]">
          {categoryAndFollowersFilteredPosts.map(postOfRg => (
            <div key={postOfRg._id} className="bg-white rounded-lg overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] m-10 border-b h-[700px] min-w-[400px]">
              <div className="flex items-center p-2 cursor-pointer" >
                <img
                  src={
                    postOfRg && postOfRg.postedBy && postOfRg.postedBy.ProfilPhoto
                      ? `http://localhost:3000/Images/${postOfRg.postedBy.ProfilPhoto}`
                      : blankPP
                  }
                  className="w-10 h-10 rounded-full mr-2 cursor-pointer"
                />
                <p onClick={() => handleGotoUserProfile(postOfRg.postedBy && postOfRg.postedBy._id)} className="font-bold text-xl cursor-pointer">{postOfRg.postedBy && postOfRg.postedBy.username}</p>
              </div>
              <div className="w-full  flex items-center justify-center w-auto min-h-[420px]">
                {postOfRg.file && isVideo(postOfRg.file) ? (
                  <video controls className="w-full h-full object-cover">
                    <source src={`http://localhost:3000/Videos/${postOfRg.file}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (

                  <img onClick={() => handleGotoPost(postOfRg._id)} src={`http://localhost:3000/Images/${postOfRg.file}`} alt={postOfRg.title || 'Post'} className="object-cover" />
                )}

              </div>


              <div onClick={() => setshowLikesOfPostList(true)} className=" ml-4 flex items-center">
                {postOfRg.likes.length} likes

              </div>

              {showLikesOfPostList && (
                <>
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setshowLikesOfPostList(false)}></div>
                  <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center overflow-y-scroll">
                    <h1 className="text-xl">Likes</h1>
                    {posts && posts.map(post => (
                      <div key={post._id}>
                        <h2 className="text-lg">{post.title}</h2>
                        {post.likes && post.likes.map(like => (
                          <div key={like._id} className="flex items-center mb-2">
                            <img src={like.ProfilPhoto ? `http://localhost:3000/Images/${like.ProfilPhoto}` : blankPP} className="w-10 h-10 rounded-full mr-2" alt="Profile" />
                            <p>{like.username}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="p-2">
                <h2 className="truncate text-sm font-semibold text-gray-900">{postOfRg.title}</h2>
                <p className="text-xs text-gray-700">{postOfRg.description}</p>
                <div className="flex mt-2">
                  <span onClick={() => { handleLikeToggle(postOfRg._id); handleNotification(1, postOfRg && postOfRg.postedBy.username, postOfRg && postOfRg._id, postOfRg && postOfRg.file) }} className={`cursor-pointer material-symbols-outlined ${postOfRg.likes.includes(loggedUserInformation.id) ? 'text-green-500' : ''}`}>
                    thumb_up
                  </span>
                  <span onClick={() => handleViewAllComments(postOfRg._id)} className="cursor-pointer ml-2 material-symbols-outlined">
                    chat_bubble
                  </span>
                </div>


                {/* View All Comments Button */}
                <button className="text-sm text-gray-500 mt-2 mb-2" onClick={() => handleViewAllComments(postOfRg._id)}>
                  {postOfRg.comments && postOfRg.comments.length > 0 ? `View All ${postOfRg.comments.length} Comments` : "No Comments"}
                </button>




                {/* Text field for comments */}
                <div>
                  <input

                    className="w-full"
                    type="text"
                    placeholder="Add a comment..."
                    value={commentTexts[postOfRg._id] || ''}
                    onChange={(e) => handleCommentChange(postOfRg._id, e)}

                  />
                  {/* Conditionally render submit button */}
                  {commentTexts[postOfRg._id]?.trim() && <button className="bg-primary font-bold text-white w-10 mt-3" onClick={() => { handleCommentSubmit(postOfRg._id); handleNotification(2, postOfRg && postOfRg.postedBy.username, postOfRg && postOfRg._id, postOfRg && postOfRg.file) }}>Post</button>}
                </div>
              </div>
            </div>
          ))}



        </div>
    </div>

    


  )
}

export default Feed