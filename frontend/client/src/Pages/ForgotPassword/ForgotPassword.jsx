import axios from "axios";
import { useState } from "react"
import { toast } from "react-toastify";

const ForgotPassword = () => {
 
    const [email,setEmail] = useState("")
 
    
    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post("http://localhost:3000/forgotPassword", {email})
        .then(response => {
            if(response.data.status) {
                toast.success('Reset Link has sent.', { position: 'top-center' });
                console.log(response)
            } else {
                toast.error('Reset Link can not send.', { position: 'top-center' });

            }
        })

    }
 
    return (
    <div className="bg-primary h-screen flex justify-center items-center px-4 py-4">
        <div className="bg-white w-[600px] px-12 py-12 ">
                <h2 className="text-center text-primary font-bold text-2xl">Forgot Your Password?</h2>

                <div className="mb-4 gap-2 items-center">
                  <div className="flex-grow">
                      <label className="block text-gray-700 text-1xl font-bold mb-1" htmlFor="email">
                         Email
                        </label>
                      <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="email"
                      type="email"
                      name="email"
                      placeholder="Email"
                      onChange={ (e) => setEmail(e.target.value)}
                     
             
                      />
                    </div>
                    

                </div>

                <div className="mt-3 items-center flex">
                 <button
                  className="w-full bg-black text-white py-2" 
                  type="submit"
                  onClick={handleSubmit}
                  > Send Reset Code </button>
                 </div>  

       
        </div>











    </div>
  )
}

export default ForgotPassword