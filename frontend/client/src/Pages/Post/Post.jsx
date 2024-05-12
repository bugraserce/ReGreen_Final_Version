import axios from "axios"
import { useEffect, useState, useContext } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import FeederNav from "../../FeederNav/FeederNav"
import { CiEdit } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import { userContext } from "../../App";
import portraitPhoto from "../../assets/images/Portait_Photo.jpg"
import blankPP from "../../assets/images/blankPP.jpeg"
import { SlOptions } from "react-icons/sl";
import { toast } from "react-toastify";





const Post = ({ socket, user }) => {
    const userInformation = useContext(userContext)
    const { id } = useParams() //get id from url
    const [post, setPost] = useState({})
    const [commentText, setCommentText] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showCommentsOptions, setShowCommentsOptions] = useState(false)
    const [showPostOptions, setShowPostOptions] = useState(false)

    const navigate = useNavigate()

    const getNotificationsFromLocalStorage = () => {
        const storedNotifications = localStorage.getItem("notifications");
        return storedNotifications ? JSON.parse(storedNotifications) : [];
    };

    useEffect(() => {
        const storedNotifications = getNotificationsFromLocalStorage();
        setNotifications(storedNotifications);
    }, []);


    useEffect(() => {
        axios.get('http://localhost:3000/getPostbyid/' + id)
            .then(response => {
                const post = response.data;
                console.log(post)
                post.likedByCurrentUser = post.likes.includes(userInformation._id); // Adjust this line
                setPost(post);
            }).catch(err => console.log(err));
    }, [id, userInformation, commentText]); // Added dependencies


    const handleDelete = (id) => {
        axios.delete('http://localhost:3000/deletePost/' + id)
            .then(result => {
                console.log(result)
                navigate(`/profile/${userInformation.id}`)
                toast.success('Post Deleted', { position: 'top-center' });

            })
            .catch(err => {
                toast.success('Post Deleted', { position: 'top-center' });
                console.log("Error deleting post ", err)
            })
               
    }


    const [likeInProgress, setLikeInProgress] = useState(false);

    const handleLikeToggle = (postId) => {
        if (!likeInProgress) {
            setLikeInProgress(true);
            // If the user has already liked the post, unlike it

            if (post.likes && post.likes.includes(userInformation.id)) {
                axios.put('http://localhost:3000/unlike', { postId })
                    .then(response => {
                        const updatedPost = { ...post };
                        updatedPost.likes = updatedPost.likes.filter(userId => userId !== userInformation.id);
                        updatedPost.likedByCurrentUser = false;
                        setPost(updatedPost);
                        setLikeInProgress(false); // Reset likeInProgress after request completes
                    })
                    .catch(error => {
                        console.log(error);
                        setLikeInProgress(false); // Reset likeInProgress on error
                    });
            } else {
                // If the user hasn't liked the post, like it
                axios.put('http://localhost:3000/like', { postId })
                    .then(response => {
                        const updatedPost = { ...post };
                        updatedPost.likes.push(userInformation.id);
                        updatedPost.likedByCurrentUser = true;
                        setPost(updatedPost);
                        setLikeInProgress(false); // Reset likeInProgress after request completes
                        handleNotification(1);
                    })
                    .catch(error => {
                        console.log(error);
                        setLikeInProgress(false); // Reset likeInProgress on error
                    });
            }
        }
    };



    const handleCommentChange = (e) => {
        setCommentText(e.target.value); // Update comment text state as user types
        // Scroll to the comment field area

    };


    const handleCommentSubmit = (postId) => {
        //console.log(`Comment for post ${postId}: ${commentText}`);
        axios.put('http://localhost:3000/comment', { commentText, postId })
            .then(response => {
                console.log(response)
            })
        handleNotification(2);


        setCommentText('');
        window.location.reload()
    };


    const handleNotification = (type) => {


    }

    const isVideo = (filename) => {
        const videoExtensions = ['.mp4', '.mov', '.avi']; // Add more if needed
        const ext = filename.split('.').pop();
        return videoExtensions.includes(`.${ext}`);
    };

    const handleDeleteComment = (commentID, postID) => {
        axios.delete('http://localhost:3000/deleteComment', { data: { commentID, postID } })
            .then(response => {
                console.log("delete comment ", response.data);
            })
            .catch(error => {
                console.error("Error deleting comment:", error);
            });
    }


    const handleReportComment = () => {
        toast.success('Report sent.', { position: 'top-center' });


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


    return (
        <div className="login-page">
            <FeederNav />

            <div className="max-w-lg mx-auto bg-white rounded-lg shadow-2xl overflow-hidden px-5 py-8 h-[90vh]">





                {post.file && (
                    <div className="max-w-lg mx-auto border border-gray-300 rounded-lg overflow-hidden shadow-md mb-8">
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="flex items-center">
                                <img
                                    src={post && post.postedBy.ProfilPhoto ? `http://localhost:3000/Images/${post.postedBy.ProfilPhoto}` : blankPP}
                                    className="w-10 h-10 rounded-full mr-2"
                                    alt="Profile"
                                />
                                <p onClick={() => navigate(`/profile/${post.postedBy._id}`)} className="font-bold text-lg cursor-pointer">{post.postedBy.username}</p>
                            </div>
                            <div>
                                <SlOptions onClick={() => setShowPostOptions(true)} className="cursor-pointer" />
                                {showPostOptions && (
                                    <>
                                        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowPostOptions(false)}></div>
                                        <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center overflow-y-scroll border-b-4 border-gray-300">
                                            <h2 className="mb-3 font-bold">Post Options</h2>
                                            {
                                                post.postedBy && post.postedBy._id === userInformation.id ?
                                                    <div className="border-b border-gray-400 py-2">
                                                        <button onClick={(() => navigate(`/editPost/${id}`))} className="text-primary hover:opacity-80 focus:outline-none text-xl font-bold">
                                                            Edit <CiEdit size={20} className="inline-block text-xl ml-1"></CiEdit>
                                                        </button>
                                                        <div className="border-b border-gray-400 py-2"></div>
                                                        <button onClick={() => handleDelete(id)} className="text-red-500 hover:text-red-700 focus:outline-none text-xl font-bold">
                                                            Delete <MdDeleteForever size={20} className="inline-block text-xl ml-1"></MdDeleteForever>
                                                        </button>
                                                        <div className="border-b border-gray-400 py-2"></div>

                                                        <button className="text-black-600 font-bold" onClick={handleCopyUrl}>
                                                            Share Posts Link
                                                        </button>
                                                        {copySuccess && <span className="text-green-700 ml-2 text-xl fond-bold">URL copied!</span>}

                                                    </div>

                                                    :

                                                    <div className="border-b border-gray-400 py-2">
                                                        <button onClick={() => handleReportComment()} className="text-red-500 hover:text-red-700 text-xl font-bold focus:outline-none">
                                                            Report
                                                        </button>
                                                        <div className="border-b border-gray-400 py-2"></div>

                                                        <button className="text-black-600 font-bold" onClick={handleCopyUrl}>
                                                            Share Posts Link
                                                        </button>
                                                        {copySuccess && <span className="text-green-700 ml-2 text-xl fond-bold">URL copied!</span>}
                                                    </div>
                                            }
                                        </div>
                                    </>
                                )}




                            </div>
                            

                        </div>
                        <div className="relative">
                            {post.file.includes('.mp4') ? (
                                <video className="w-full" controls>
                                    <source src={`http://localhost:3000/Videos/${post.file}`} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img src={`http://localhost:3000/Images/${post.file}`} alt="" className="w-full h-auto" />
                            )}
                        </div>
                    </div>
                )}


                <div className="p-4">
                    <h2>{post.likes && post.likes.length} likes</h2>
                    <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
                    <p className="text-gray-600">{post.description}</p>
                </div>

                <div className="flex mt-1">
                    <span onClick={() => {
                        handleLikeToggle(post._id);
                        handleNotification(1);
                    }}
                        className={`cursor-pointer material-symbols-outlined ${post.likes?.includes(userInformation.id) ? 'text-green-500' : ''}`}>
                        thumb_up
                    </span>

                    <span className="cursor-pointer ml-2 material-symbols-outlined">
                        chat_bubble
                    </span>
                </div>

                <div>
                    <input
                        className="w-full mt-2"
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={handleCommentChange}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleCommentSubmit(post._id);
                                handleNotification(2);
                            }
                        }}
                    />
                    {/* Conditionally render submit button */}
                    {commentText.trim() && (
                        <button className="bg-primary font-bold text-white w-10 mt-3" onClick={() => { handleCommentSubmit(post._id); handleNotification(2); }}>Post</button>
                    )}
                </div>

                <div className="max-w-screen-lg mx-auto   overflow-hidden ">
                    <div className="flex justify-start">
                        <div className=" w-[500px] h-[500px] bg-white rounded-lg overflow-hidden shadow-sm ml-0">
                            {/* Comments container */}
                            <div className="p-4">
                                {/* Example comment */}
                                {post.comments && post.comments.map((comment, index) => (
                                    <div key={index} className="flex items-center mb-4">
                                        <img src={comment.info && comment.info.pp ? `http://localhost:3000/Images/${comment.info.pp}` : blankPP} className="w-8 h-8 rounded-full mr-2" />
                                        <div>
                                            <p onClick={() => navigate(`/profile/${comment.postedBy}`)} className="text-sm font-semibold cursor-pointer">{comment.info && comment.info.username}</p>

                                            <p className="text-sm text-gray-500">{comment.comment && comment.comment}</p>
                                            <div className="flex">
                                                <button onClick={() => setShowCommentsOptions(true)} className="">...</button>
                                                {showCommentsOptions && (
                                                    <>
                                                        <div className="fixed inset-0 bg-opacity-50 z-40" onClick={() => setShowCommentsOptions(false)}></div>
                                                        <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center">
                                                            <h2 className="mb-3 font-bold">Comments Options</h2>
                                                            {post.postedBy && post.postedBy._id === userInformation.id  ? (
                                                                <div>
                                                                    <div className="border-b border-gray-400 py-2">
                                                                        <button onClick={() => handleDeleteComment(comment._id, id)} className="text-red-600 font-bold text-xl cursor-pointer">
                                                                            Delete
                                                                        </button>
                                                                    </div>

                                                                    <div className="border-b border-gray-400 py-2">
                                                                        <button onClick={() => handleReportComment(comment._id)} className="text-red-600 font-bold text-xl cursor-pointer">
                                                                            Report
                                                                        </button>

                                                                    </div>


                                                                </div>


                                                            ) : (
                                                                <button onClick={() => handleReportComment(comment.info._id)} className="text-red-600 font-bold text-xl cursor-pointer">
                                                                    Report
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}


                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Post