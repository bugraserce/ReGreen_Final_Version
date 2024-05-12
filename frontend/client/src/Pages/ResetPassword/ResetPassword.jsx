import { useEffect, useState } from "react"
import { FaEye } from "react-icons/fa"
import { Link, useNavigate, useParams } from "react-router-dom"
import axios from "axios";
import { toast } from "react-toastify";


const ResetPassword = () => {

  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const { token } = useParams();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const PasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {

    const isPasswordValid = /^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password);

    setIsFormValid(isPasswordValid)
  },[password])




  const handleSubmit = (e) => {
    e.preventDefault();
   
    if (!isFormValid) {
      (true);
      if (!/^(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) {
        toast.error('Password must be at least 8 characters long and include at least one special character.', { position: 'top-center' });
      }
      return 
    }  
   
    axios.post("http://localhost:3000/resetPassword/" + token, { password })
      .then(response => {
        if (response.data.status) {
          navigate('/login')
          toast.success('Password changed')
        }
        console.log(response)
      })

  }

  return (
    <div className="bg-primary h-screen flex justify-center items-center px-4 py-4">
      <div className="w-full max-w-[680px] bg-white px-12 py-8 rounded-md">
        <h2 className="font-bold text-center text-4xl text-primary">Reset Your Password</h2>




        <div className="mb-4 relative">
          <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="password">
            New Password
          </label>
          <div className="flex justify-between">
            <input
              type={isPasswordVisible ? "text" : "password"}
              name="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="*******"
              onChange={(e) => setPassword(e.target.value)}

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
            className="w-full bg-black text-white py-2"
            type="submit"
            onClick={handleSubmit}
          > Reset Password </button>
        </div>

        <Link to="/login" className="inline-block text-lightGray align-baseline mt-4 font-bold text-sm" href="/login">
          Already have an account? <span className="text-primary">Login</span>
        </Link>






      </div>








    </div>
  )
}

export default ResetPassword