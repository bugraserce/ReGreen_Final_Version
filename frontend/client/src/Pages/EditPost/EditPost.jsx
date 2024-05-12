import { useContext, useEffect, useState } from "react";
import FeederNav from "../../FeederNav/FeederNav"
import { FaRegPlusSquare } from "react-icons/fa";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { userContext } from "../../App";
import '../../custom.css'


const EditPost = () => {
    const [title, setTitle] = useState();
    const [desc, setDescription] = useState();
    const userInformation = useContext(userContext)

    const {id} = useParams()

    const navigate = useNavigate()

    useEffect(() => {

        axios.get("http://localhost:3000/getPostbyid/"+id)
        .then(result => {
            setTitle(result.data.title)
            setDescription(result.data.description)

        })
        .catch(err=> console.log(err))


    },[])

    const handleSubmit = (e) => {
        e.preventDefault();
    
        axios.put("http://localhost:3000/editPost/" + id , {title,desc})
        .then(res=> {
            if(res.data === "Succes") {
                navigate(`/post/${id}`)
                toast.success('Post Edited', { position: 'top-center' });


            }
        })    


    }


    return (
        <div>
            <FeederNav></FeederNav>

            <div className="max-w-md mx-auto login-page">
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div className="mb-4">
                        <h2 className="text-center text-primary text-3xl font-bold">Edit Post</h2>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Enter
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text" 
                            placeholder="Enter Title" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="desc">
                            Description
                        </label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="desc" 
                            name="desc"
                            cols="30"
                            rows="10"
                            placeholder="Description"
                            value={desc}
                            onChange={(e) => setDescription(e.target.value)} ></textarea>
                    </div>
                   



                    <div className="flex items-center justify-between">
                        <button
                            className="bg-primary hover:bopacity-80 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit">
                            <FaRegPlusSquare size={30}></FaRegPlusSquare> Update

                        </button>
                    </div>
                </form>
            </div>




        </div>



    )
}

export default EditPost