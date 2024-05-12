import { Link } from "react-router-dom"
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai"
import { useState } from "react"
import test from "./regreen-logo.png"


const Navbar = () => {

    const [nav, setNav] = useState(true)

    const handleNav = () => {
        setNav(!nav);
    }
    return (
        <header className="bg-primary flex justify-center items-center h-14 text-white h-[10vh]">
            <Link className=" " to="/">
                <div className="">
            <img src={test} alt="" width={200} className="h-[150px] w-[150px]"/>
                </div>
            </Link>

            <ul className="hidden md:flex text-2xl mr-5 ">
                <li className="p-4 hover:shadow-2xl"><Link to="/"> Home</Link> </li>
                <li className="p-4 hover:shadow-2xl"><Link to="/about"> About</Link> </li>
                <li className="p-4 hover:shadow-2xl"><Link to="/contact"> Contact</Link> </li>
            </ul>


            <div onClick={handleNav} className="block md:hidden">
                {!nav ? <AiOutlineClose size={30} /> : <AiOutlineMenu size={30}></AiOutlineMenu>}

            </div>

            <div className={!nav ? 'mr-5 fixed left-0 top-0 w-[34%] text-black bg-primary ease-out duration-500 md:hidden' : 'fixed left-[-100%]'}>
                <Link className="text-3xl font-bold text-white ml-5  " to="/home"> </Link>
                <ul className="p-4 uppercase">
                    <li className="p-4 border-b border-gray-100"><Link to="/home"> Home</Link> </li>
                    <li className="p-4 border-b border-gray-100"><Link to="/about"> About</Link> </li>
                    <li className="p-4"><Link to="/contact"> Contact</Link> </li>
                </ul>

            </div>



        </header>


    )
}

export default Navbar