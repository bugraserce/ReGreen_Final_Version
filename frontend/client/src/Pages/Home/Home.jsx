import Navbar from "../../Navbar.jsx/Navbar"
import { Link } from "react-router-dom"
import regreenBanner from "../../assets/images/regreen-banner.png"
import "./Home.css"
import test from "./logo-test4.png"

const Home = () => {
  return (

    <div className="bg-white">
      <Navbar className="h-20"></Navbar>

      <div className="flex flex-col md:flex-row items-center justify-around p-10 h-[93.5vh] main-page">
        <div className="flex flex-col justify-center  lg:-mt-20">
          <p className="text-5xl">
            <span className="text-primary"> <img src={test} alt="" /></span> makes sustainable living fun and accessible.
          </p>

          <p className="mt-6 text-darkGray text-lg mb-3">Join us for free to experience a sustainable world!</p>
          <Link to="/login" className="bg-primary w-[146px] h-12 flex justify-center items-center rounded text-white font-semibold hover:opacity-80">
            Login
          </Link>
          <p className="mt-3 font-semibold text-lightGray">
            Dont have an account?{" "}
            <Link to="register" className="text-primary hover:opacity-80">
              Register
            </Link>
          </p>
        </div>
        <img src={regreenBanner} alt="ReGreen" width={475} />
      </div>


    </div>


  )
}

export default Home