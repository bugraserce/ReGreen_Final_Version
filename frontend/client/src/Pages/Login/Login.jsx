import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaEye } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import "./Login.css"
import Navbar from "../../Navbar.jsx/Navbar";




const Login = () => {

    const [isFormValid, setIsFormValid] = useState(false);

    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    useEffect(() => {
        const isFormFilled = formData.email && formData.password;
        setIsFormValid(isFormFilled);
    }, [formData])

    const onChangeValue = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const [isPasswordVisible, setPasswordVisible] = useState(true)

    const PasswordVisibility = () => {
        setPasswordVisible(!isPasswordVisible)
    }

    axios.defaults.withCredentials = true;
    const handleLogin = (e) => {
        e.preventDefault();

        if (!formData.password || !formData.email) {
            toast.error('Please fill all the fields to login', { position: 'top-center' });

        }


        axios.post("http://localhost:3000/login", formData)
            .then(response => {
                if (response.data.status) {
                    navigate('/feed')
                    window.location.reload()
                } else {
                    toast.error('Email or password is wrong', { position: 'top-center' });
                }


            }).catch(err => {
                console.log(err)
                toast.error('Login Failed', { position: 'top-center' });


            })


    }

    useEffect(() => {

    }, [])



    return (
        <div>
                  <Navbar/>

            <div className="bg-primary h-screen flex justify-center items-center px-4 py-4 login-page">


                <div className="w-full max-w-[680px] bg-white px-12 py-8 rounded-md">
                    <h2 className="font-bold text-center text-4xl text-primary">Login</h2>
                    <form onSubmit={handleLogin}> {/* Add form element with onSubmit handler */}
                        <div className="mb-4 gap-2 items-center">
                            <div className="flex-grow ">
                                <label className="block text-gray-700 text-1xl font-bold mb-1" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    className="shadow appearance-none border rounded w-11/12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={onChangeValue}
                                />
                            </div>
                        </div>
                        <div className="mb-4 relative ">
                            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="password">
                                Password
                            </label>
                            <div className="flex justify-start">
                                <input
                                    type={isPasswordVisible ? "password" : "text"}
                                    name="password"
                                    id="password"
                                    className="w-11/12 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    placeholder="******"
                                    value={formData.password}
                                    onChange={onChangeValue}
                                />
                                <span className="ml-2 flex items-center text-sm leading-5 cursor-pointer" >
                                    <FaEye onClick={PasswordVisibility} />
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                Your password must include at least one special character and be at least 8 characters long.
                            </p>
                        </div>
                        <div className="mt-3 items-center flex">
                            <button
                                className="bg-black text-white p-2 w-11/12 hover:opacity-80 rounded"
                                type="submit"
                            >
                                Login
                            </button>
                        </div>
                    </form> {/* Close form element */}
                    <div className="inline-block">
                        <Link to="/register" className="ml-15inline-block text-light Gray align-baseline mt-4 font-bold text-sm" href="/login">
                            Dont Have Account?<span className="text-primary ml-2 hover:opacity-80">Sign Up</span>
                        </Link>
                        <Link to="/forgotPassword" className="inline-block text-light Gray align-baseline mt-4 font-bold text-sm ml-20" href="/login">
                            Forgot your password?<span className="text-primary ml-2 hover:opacity-80">Click Here</span>
                        </Link>
                    </div>
                </div>
            </div>

    </div>      
            )
}

            export default Login