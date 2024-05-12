import React, { useContext, useEffect, useState } from 'react';
import FeederNav from '../../FeederNav/FeederNav';
import portraitPhoto from "../../assets/images/Portait_Photo.jpg"
import blankPP from "../../assets/images/blankPP.jpeg"
import { userContext } from '../../App';
import axios from 'axios';
import { MdBlock } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { FaEye } from "react-icons/fa";




const EditProfile = () => {
    const loggedUserInformation = useContext(userContext)
    const [section, setSection] = useState('basic'); // State to manage which section is active
    const [profilePhoto, setProfilPhoto] = useState()
    const [ppUpdate, setPPupdate] = useState()
    const [getPPfromDB, setPPfromDB] = useState()
    const [userData, setUserData] = useState({})
    const [showBlockedUserList, setshowBlockedUserList] = useState(false)
    const [blockedUsers, setBlockedUsers] = useState([])
    const [showDeleteAccountBox, setShowDeleteAccountBox] = useState(false)

    const myID = loggedUserInformation.id
    const navigate = useNavigate()
    const [isPrivateAccount, setPrivateAccount] = useState(false); // Default to public

    const handleToggleChangePrivacy = (e) => {
        const newPrivateStatus = e.target.checked;
        setPrivateAccount(newPrivateStatus);

        updateUserPrivacy(myID, newPrivateStatus)


    }


    const [basicInfoFormData, setBasicFormData] = useState({
        username: "",
        email: "",
        aboutMe: ""
    })

    useEffect(() => {
        const { username, email, aboutMe } = basicInfoFormData;
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isUsernameValid = username.length >= 3;
        const isAboutMeValid = aboutMe.length<=150;
    
        setIsFormValid(isEmailValid && isUsernameValid && isAboutMeValid );
      }, [basicInfoFormData]);
    


    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false)
    const CurrentPasswordVisibility = () => {
        setIsCurrentPasswordVisible(!isCurrentPasswordVisible)
      }
    
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false)
    const NewPasswordVisibility = () => {
        setIsNewPasswordVisible(!isNewPasswordVisible)
      }
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
    const ConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
      }



    const [PasswordFormData, setChangePassword] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const handleChangePassword = (e) => {
        const { name, value } = e.target
        setChangePassword({ ...PasswordFormData, [name]: value })
    }

    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const { newPassword, confirmPassword } = PasswordFormData;
        const isNewPasswordValid = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(newPassword);
        const isPasswordsMatch = newPassword === confirmPassword;

        setIsFormValid(isNewPasswordValid && isPasswordsMatch);
    }, [PasswordFormData]);

    const handleSubmitePassword = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            (true);
            if (PasswordFormData.newPassword && !/^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(PasswordFormData.newPassword)) {
                toast.error('Password must be at least 8 characters long and include at least one special character.', { position: 'top-center' });
            }
            // Check if new password matches confirm password
            if (PasswordFormData.newPassword && PasswordFormData.confirmPassword && PasswordFormData.newPassword !== PasswordFormData.confirmPassword) {
                toast.error('Passwords are not matched.', { position: 'top-center' });
            }

            if (!PasswordFormData.confirmPassword || !PasswordFormData.newPassword || !PasswordFormData.oldPassword) {
                toast.error('Please fill the all passwords field.', { position: 'top-center' });

            }

        }



        try {
            const response = await axios.post("http://localhost:3000/changePassword", PasswordFormData);
            console.log(response.data);
            // Optionally, you can show a success message to the user
            if (response.data) {
                toast.success('Password changed successfully', { position: 'top-center' });
                setChangePassword({
                    oldPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // If the status code is 400, it means the current password is invalid
                toast.error('Invalid current password', { position: 'top-center' });
            } else {
                // For other errors, log the error to the console
                console.error('Error changing password:', error);
            }
        }


    }

    // Function to handle section change


    useEffect(() => {
        if (Object.keys(userData).length === 0) { // Check if userData is empty
            axios.get("http://localhost:3000/getProfileInf")
                .then(response => {
                    console.log("getPRofileInfoInEditPAge: ", response.data);
                    const GetPPFORSET = response.data.user.ProfilPhoto;
                    const userInfo = response.data.user;
                    setUserData(userInfo);
                    setPPfromDB(GetPPFORSET);
                    const userPrivacy = response.data.user.profileLocked;
                    setPrivateAccount(userPrivacy);
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        }
    }, []); // Run only if userData changes or initially if it's empty
    

    const handleSectionChange = (sectionName) => {
        setSection(sectionName);
    };

    const handleBasicInfoChange = (e) => {
        const { name, value } = e.target
        setBasicFormData({ ...basicInfoFormData, [name]: value });

    }

    const handleSubmitBasicInfo = (e) => {
        e.preventDefault();
       
        axios.post("http://localhost:3000/editBasicInfos", basicInfoFormData)
            .then(response => {
                console.log("basicInfoChange: ", response.data);
                if (response.status === 200) {
                    toast.success('Information changed.', { position: 'top-center' });
                    setBasicFormData({
                        ...basicInfoFormData,
                        username: response.data.username,
                        email: response.data.email,
                        aboutMe: response.data.aboutMe
                    });
                } else if (response.status === 400) {
                    toast.error(response.data.error, { position: 'top-center' });
                } else {
                    toast.error('An unexpected error occurred.', { position: 'top-center' });
                }
            })
            .catch(error => {
                console.error('Error changing basic info:', error);
                toast.error('An unexpected error occurred.', { position: 'top-center' });
            });
    }

    const handleUploadPhoto = (e) => {
        e.preventDefault(); // Prevent default if within a form 

        const profilePicData = new FormData();
        profilePicData.append('profilePicture', profilePhoto);

        axios.post("http://localhost:3000/uploadProfilePhoto", profilePicData, {

        }).then(response => {
            console.log(response);
            const uploadPhotoResponse = response.data.ProfilPhoto
            console.log(uploadPhotoResponse)
            setPPupdate(uploadPhotoResponse)
            toast.success('New photo uploaded ', { position: 'top-center' });


        })
            .catch(error => {
                console.error("Error uploading the image:", error);
                toast.error('Error uploading the image.', { position: 'top-center' });

            });

    };

    const removeCurrentPhoto = () => {
        axios.post("http://localhost:3000/removeProfilePhoto")
            .then(response => {
                console.log(response);
                // Assuming your server responds with a success message or updated user data
                // You can update the profile photo state or any other relevant data as needed
                setPPupdate(null); // Update the profile photo state to null or any default value
                toast.success('Photo is removed ', { position: 'top-center' });

            })
            .catch(error => {
                console.error("Error removing the profile photo:", error);
                toast.error('Error removing the profile photo.', { position: 'top-center' });

            });
    };




    const updateUserPrivacy = async (myId, isPrivate) => {
        try {
            const response = await axios.post('http://localhost:3000/updatePrivacy', {
                userId: myId,
                isPrivate: isPrivate
            });

            console.log('Privacy settings updated successfully:', response.data);

        } catch (error) {
            console.error('Error updating privacy settings:', error);
        }
    };


    useEffect(() => {
        axios.get('http://localhost:3000/getBlockedUsers')
            .then(response => {
                console.log(response)
                setBlockedUsers(response.data)
            })


    }, [showBlockedUserList])

    const unblockUser = (userID) => {
        axios.put('http://localhost:3000/unBlockUser', { userID })
            .then(response => {
                console.log(response.data)
            })
        window.location.reload();
        toast.success('User unblocked.', { position: 'top-center' });



    }

    const deleteMyAccount = () => {
        axios.delete("http://localhost:3000/deleteMyAccount")
            .then(response => {
                if (response.data === "Succes") {
                    toast.error('Account deleted succesfully.', { position: 'top-center' });
                    navigate('/')

                }
                console.log("AccountDelete.Response", response.data)


            })
    }


    

    return (
        <div>
            <FeederNav />

            <div className="max-w-2xl mx-auto mt-10 px-4 ">
                <h1 className="text-2xl font-bold mb-4 text-center text-primary">Edit Profile</h1>

                {/* Navigation bar */}
                <nav className="flex justify-center mb-4 bg-prim">
                    <ul className="flex space-x-4">
                        <li className={section === 'basic' ? 'font-bold' : ''}>
                            <button onClick={() => handleSectionChange('basic')}>Basic Info</button>
                        </li>
                        <li className={section === 'profile-pic' ? 'font-bold' : ''}>
                            <button onClick={() => handleSectionChange('profile-pic')}>Change Profile Picture</button>
                        </li>
                        <li className={section === 'password' ? 'font-bold' : ''}>
                            <button onClick={() => handleSectionChange('password')}>Change Password</button>
                        </li>
                        <li className={section === 'private' ? 'font-bold' : ''}>
                            <button onClick={() => handleSectionChange('private')}>Account Settings</button>
                        </li>

                    </ul>
                </nav>

                {/* Basic info section */}
                <div className={section === 'basic' ? '' : 'hidden'}>
                    {/* Basic info inputs */}
                    <div className="flex items-center max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-md">

                        <form className="space-y-4 w-full">

                            {/* Username */}
                            <div className="mb-4">
                                <label htmlFor="username" className="block text-sm font-bold text-gray-700">Edit Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={basicInfoFormData.username}
                                    onChange={handleBasicInfoChange}
                                    placeholder={userData && userData.username}
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-black-500 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            {/* Email */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700">Edit Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={basicInfoFormData.email}
                                    onChange={handleBasicInfoChange}
                                    placeholder={userData && userData.email}
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            {/* Bio */}
                            <div className="mb-4">
                                <label htmlFor="bio" className="block text-sm font-bold text-gray-700">Edit About Me</label>
                                <textarea
                                    id="aboutMe"
                                    name="aboutMe"
                                    value={basicInfoFormData.aboutMe}
                                    placeholder={userData && userData.aboutMe}
                                    onChange={handleBasicInfoChange}
                                    className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 "
                                ></textarea>
                            </div>

                            {/* Save Changes Button */}
                            <button
                                type="submit"
                                className="bg-primary text-white py-2 px-4 rounded-md hover:opacity-80 focus:outline-none focus:ring-2 ffocus:ring-primary focus:ring-offset-2 cursor-pointer"
                                onClick={handleSubmitBasicInfo}

                            >
                                Save Changes
                            </button>
                        </form>
                    </div>



                </div>

                {/* Profile picture section */}
                <div className={section === 'profile-pic' ? '' : 'hidden'}>
                    {/* Profile picture inputs */}

                    {/* Profile Picture */}
                    <div className="flex items-center max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
                        <img
                            src={ppUpdate ? `http://localhost:3000/Images/${ppUpdate}` : `http://localhost:3000/Images/${getPPfromDB}`}
                            className="w-32 h-32 rounded-full mb-4 md:mr-8"
                            alt="Profile"
                        />

                        <div>
                            <label htmlFor="profilePicture" className="block text-sm font-bold text-gray-700">Change Profile Picture</label>
                            <input

                                type="file"
                                id="profilePicture"
                                name="profilePicture"
                                accept="image/*"
                                className="mt-2 shadow-sm sm:text-sm border-gray-300 rounded-md"
                                onChange={(e) => setProfilPhoto(e.target.files[0])}
                            />

                            <button
                                type="submit"
                                className="bg-red-500 w-[250px] text-white py-2 px-4 rounded-md hover:opacity-80 focus:outline-none focus:ring-2 mt-4 focus:ring-offset-2"
                                onClick={removeCurrentPhoto}
                            >
                                Remove Current Photo
                            </button>

                            <button
                                type="submit"
                                className="bg-primary w-[250px] text-white py-2 px-4 rounded-md hover:opacity-80 focus:outline-none focus:ring-2 mt-4 focus:ring-offset-2"
                                onClick={handleUploadPhoto}
                            >
                                Upload New Photo
                            </button>
                        </div>
                    </div>

                </div>

                {/* Password section */}
                <div className={section === 'password' ? '' : 'hidden'}>
                    {/* Password inputs */}
                    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
                        <h2 className="text-xl font-semibold mb-4 text-center">Change Password</h2>

                        <form onSubmit={handleSubmitePassword}>
                            <div className="mb-4 ">
                                <label className="block text-sm font-medium">Current Password</label>
                               <div className='flex justify-between'>
                               <input
                                    type={isCurrentPasswordVisible ? "text" : "password"}
                                    name="oldPassword"
                                    value={PasswordFormData.oldPassword}
                                    onChange={handleChangePassword}
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-black-500 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"></input>
                                      <span className="ml-2 flex items-center text-sm leading-5 cursor-pointer" >
                                    <FaEye onClick={() => CurrentPasswordVisibility()} />
                                </span>
                           
                               </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">New Password</label>

                                <div className='flex justify-between'>
                                <input
                                    type={isNewPasswordVisible ? "text" : "password"}
                                    name="newPassword"
                                    value={PasswordFormData.newPassword}
                                    onChange={handleChangePassword}
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-black-500 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-blue-500"
                                />
                                <span className="ml-2 flex items-center text-sm leading-5 cursor-pointer" >
                                    <FaEye onClick={() => NewPasswordVisibility()} />
                                </span>
                                </div>
                                
                                <span className='text-sm'>Password must be at least 8 characters long and include at least one special character</span>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Confirm New Password</label>
                                <div className='flex justify-between'>
                                <input
                                    type={isConfirmPasswordVisible ? "text" : "password"}
                                    name="confirmPassword"
                                    value={PasswordFormData.confirmPassword}
                                    onChange={handleChangePassword}
                                    className="mt-1 block w-full shadow-sm sm:text-sm border-black-500 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-blue-500"
                                />
                                 <span className="ml-2 flex items-center text-sm leading-5 cursor-pointer" >
                                    <FaEye onClick={() => ConfirmPasswordVisibility()} />
                                </span>
                                </div>
                            </div>
                            <button type="submit" className="bg-primary text-white py-2 px-4 rounded-md hover:opacity-80 focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50">
                                Change Password
                            </button>
                        </form>
                    </div>


                </div>

                <div className={section === 'private' ? '' : 'hidden'}>

                    <div className="flex flex-col max-w-xl mx-auto mt-8 p-6 bg-white shadow-md rounded-md">

                        <label htmlFor="toggle" className="flex items-center">
                            <h2 className='p-2 font-bold'>Private account</h2>
                            <div className="relative">
                                <input
                                    id="toggle"
                                    type="checkbox"
                                    className="sr-only"
                                    onChange={handleToggleChangePrivacy}
                                    checked={isPrivateAccount}
                                />
                                <div className={`block w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${isPrivateAccount ? 'bg-primary' : 'bg-gray-600'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out ${isPrivateAccount ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </label>
                        <p className="text-gray-800 text-md md:text-base lg:text-lg mt-4 leading-relaxed ml-2">
                            When your account is public, your profile and posts can be seen by anyone, on or off ReGreen, even if they don’t have an ReGreen account.
                            When your account is private, only the followers you approve can see what you share, including your photos or videos and your followers and following lists.
                        </p>
                    </div>

                    {/* Blocked Users Section */}

                    <div className="mt-8 p-6 bg-white shadow-md rounded-md max-w-xl mx-auto">
                        <h2 className="text-lg font-bold mb-4 tex">Blocked Users</h2>
                        <button onClick={() => setshowBlockedUserList(true)} className='cursor-pointer underline font-bold text-red-500'>See and manage accounts you’ve blocked <MdBlock className="inline size-8" /> </button>
                        {showBlockedUserList && (

                            <>
                                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setshowBlockedUserList(false)}></div>
                                <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center overflow-y-scroll">
                                    <h1 className='font-bold'>Blocked Users</h1>
                                    {blockedUsers && blockedUsers.map(blockedUser => {
                                        return (
                                            <div key={blockedUser._id} className="flex items-center mb-2">
                                                <img src={blockedUser.ProfilPhoto ? `http://localhost:3000/Images/${blockedUser.ProfilPhoto}` : blankPP} className="w-10 h-10 rounded-full mr-2" />
                                                <p>{blockedUser.username}</p>
                                                <button
                                                    className="text-sm px-2 py-1 ml-2 bg-red-400 hover:bg-red-700 text-white rounded-md"
                                                    onClick={() => unblockUser(blockedUser._id)}
                                                >
                                                    Unblock
                                                </button>
                                            </div>
                                        );
                                    })}



                                </div>



                            </>



                        )}

                    </div>

                    <div className="mt-8 p-6 bg-white shadow-md rounded-md max-w-xl mx-auto">
                        <h1 className='font-bold text-xl'>Delete Account</h1>
                        <p>When you choose to delete your account, please be aware that this action is irreversible. This means that all of the data associated with your account, including your personal profile details, any content you have posted, and all your interactions with other users, will be permanently removed from our servers. Additionally, once your account is deleted, you will not be able to retrieve any of the information or content that was previously uploaded or created under your account. We take this step to ensure the privacy and security of your personal information, in accordance with data protection regulations. Please consider carefully before deciding to delete your account, as this process cannot be undone once completed.</p>
                        <button onClick={() => setShowDeleteAccountBox(true)} className="text-sm px-2 py-1 ml-2 bg-red-400 hover:bg-red-700 text-white rounded-md mt-3"
                        >Delete My Account</button>

                        {showDeleteAccountBox && (

                            <>
                                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowDeleteAccountBox(false)}></div>
                                <div className="fixed top-1/4 left-1/2 z-50 w-full max-w-xs p-5 bg-white rounded-lg shadow-lg transform -translate-x-1/2 -translate-y-1/2 text-center overflow-y-scroll">
                                    <p className='font-bold text-xl'>Are sure to delete your account?</p>
                                    <button onClick={() => deleteMyAccount()} className="text-base px-4 py-3 ml-2 bg-primary hover:bg-green-500 text-white rounded-md mt-3">Yes</button>
                                    <button onClick={() => setShowDeleteAccountBox(false)} className="text-base px-4 py-3 ml-2 bg-red-400 hover:bg-red-700 text-white rounded-md mt-3">No</button>

                                </div>

                            </>


                        )}


                    </div>


                </div>

            </div>
        </div>
    );
};

export default EditProfile;
