import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from "./Pages/Home/Home"
import Register from "./Pages/Register/Register"
import Login from "./Pages/Login/Login"
import Feed from "./Pages/Feed/Feed"
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword"
import ResetPassword from "./Pages/ResetPassword/ResetPassword"
import { createContext, useEffect, useState } from "react"
import axios from "axios"
import CreatePost from "./Pages/CreatePost/CreatePost"
import Post from "./Pages/Post/Post"
import EditPost from "./Pages/EditPost/EditPost"
import About from "./Pages/About/About"
import Contact from "./Pages/Contact/Contact"
import Profile from "./Pages/Profile/Profile"
import OtherUsers from "./Pages/OtherUsersProfile/OtherUsers"
import EditProfile from "./Pages/EditProfile/EditProfile"
import Chat from "./Pages/Chat/Chat"
import WelcomeChat from "./WelcomeChat/WelcomeChat"
import CreateGroups from "./CreateGroups/CreateGroups"
import UserAndGroups from "./UserAndGroups/UserAndGroups"
import OnlyGroups from "./OnlyGroups/OnlyGroups"
import ChatArea from "./ChatArea/ChatArea"
import { Provider } from "react-redux"
import { store } from "./Features/Store.js"
import { NotificationsProvider } from "./NotificationsContext/Notifications";
import News from "./Pages/News/News.jsx"
import Bins from "./Pages/Bins/Bins.jsx"


export const userContext = createContext();
function App() {


  const [loggedUserInformation, setUserInformation] = useState({})
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get('http://localhost:3000/')
      .then(user => {
        console.log(user);
        setUserInformation(user.data)
      })
      .catch(err => console.log(err))


  }, [])


  const RegreenRotures = () => {

    return (

      <Routes>

        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/about" element={<About></About>}></Route>
        <Route path="/contact" element={<Contact></Contact>} ></Route>




        <Route path="/register" element={<Register></Register>} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="/feed" element={<Feed></Feed>} />
        <Route path="forgotPassword" element={<ForgotPassword></ForgotPassword>} />
        <Route path="/resetPassword/:token" element={<ResetPassword></ResetPassword>} />
        <Route path="/createPost" element={<CreatePost></CreatePost>} />
        <Route path="/post/:id" element={<Post></Post>} />
        <Route path="/editPost/:id" element={<EditPost></EditPost>} />
        <Route exact path="/profile/:id" element={<Profile></Profile>} />
        <Route path="/editProfile" element={<EditProfile></EditProfile>} />
        <Route path="/news" element={<News></News>}></Route>
        <Route path="/bins" element={<Bins></Bins>}></Route>
        
        <Route path="/messages" element={<Chat />}>
          <Route path="welcomeChat" element={<WelcomeChat />} />
          <Route path="chatArea/:chatId/:chatName" element={<ChatArea></ChatArea>} />
          <Route path="createCommunity" element={<CreateGroups />} />
          <Route path="users" element={<UserAndGroups></UserAndGroups>} />
          <Route path="groups" element={<OnlyGroups></OnlyGroups>} />
        </Route>





      </Routes>


    )




  }


  return (
    <>
      <userContext.Provider value={loggedUserInformation}>
        <Provider store={store}>
          <NotificationsProvider>
            <BrowserRouter>
              <RegreenRotures />
            </BrowserRouter>
          </NotificationsProvider>
        </Provider>
      </userContext.Provider>


    </>
  )
}

export default App
