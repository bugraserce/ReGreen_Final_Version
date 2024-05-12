import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from 'axios'
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import Navbar from "../../Navbar.jsx/Navbar";
import './custom.css'

const Register = () => {

  const navigate = useNavigate();
  const [isFormValid, setIsFormValid] = useState(false);

  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };



  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",

  })

  useEffect(() => {
    const { username, email, password, confirmPassword } = formData;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isUsernameValid = username.length >= 3;
    const isPasswordValid = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
    const isPasswordsMatch = password === confirmPassword;

    setIsFormValid(isEmailValid && isUsernameValid && isPasswordValid && isPasswordsMatch);
  }, [formData]);



  const handleChangeValue = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isFormValid) {
      (true);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        toast.error('Invalid email format.', { position: 'top-center' });

      }
      if (formData.username.length < 3) {
        toast.error('Username must be at least 3 characters long.', { position: 'top-center' });
      }
      if (!/^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(formData.password)) {
        toast.error('Password must be at least 8 characters long and include at least one special character.', { position: 'top-center' });
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match.', { position: 'top-center' });
      }

      return;
    }


    axios.post("http://localhost:3000/register", formData)
      .then(response => {
        if (response.data.status)
          navigate('/login')
        toast.success('Registered Succesfully.', { position: 'top-center' });

      }).catch(err => {
        console.log(err)
      })


  }


  const [isPasswordVisible, setPasswordVisible] = useState(true);
  const PasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible)
  }



  return (

    <div>
        <Navbar/>

      <div className="bg-primary h-screen flex justify-center items-center px-4 py-4 login-page">
        <div className="w-full max-w-[680px] bg-white px-12 py-8 rounded-md">
          <h2 className="font-bold text-center text-4xl text-primary">Sign up</h2>
          <form onSubmit={handleSubmit}> {/* Add form element with onSubmit handler */}
            <div className="mb-4">
              <label className="font-bold text-sm mb-1" htmlFor="username">Username</label>
              <input
                className="shadow appearance-none border rounded w-11/12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChangeValue}
              />
            </div>
            <div className="mb-4 gap-2 items-center">
              <div className="flex-grow">
                <label className="block text-gray-700 text-sm font-bold" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-11/12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChangeValue}
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="password">
                Password
              </label>
              <div className="flex justify-start">
                <input
                  type={isPasswordVisible ? "password" : "text"}
                  name="password"
                  id="password"
                  className="shadow appearance-none border rounded w-11/12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChangeValue}
                />
                <span className="ml-2 flex items-center text-sm leading-5 cursor-pointer" >
                  <FaEye onClick={PasswordVisibility} />
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Your password must include at least one special character and be at least 8 characters long.
              </p>
            </div>
            <div className="mb-4 relative flex flex-col">
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="flex justify-start">
                <input
                  type={isConfirmPasswordVisible ? "password" : "text"}
                  name="confirmPassword"
                  id="confirmPassword"
                  className="shadow appearance-none border rounded w-11/12 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChangeValue}
                />
                <span className="ml-2 flex items-center text-sm leading-5 cursor-pointer" >
                  <FaEye onClick={toggleConfirmPasswordVisibility} />
                </span>
              </div>
            </div>
            <div className="mt-3 items-center flex">
              <button
                className="w-11/12 bg-black text-white py-2 hover:opacity-80 rounded"
                type="submit"
              >
                Register
              </button>
            </div>
          </form> {/* Close form element */}
          <Link to="/login" className="inline-block text-lightGray align-baseline mt-4 font-bold text-sm" href="/login">
            Already have an account? <span className="text-primary hover:opacity-80">Login</span>
          </Link>
        </div>
      </div>
    </div>

  )
}

export default Register