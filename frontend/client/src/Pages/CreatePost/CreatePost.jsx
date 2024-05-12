import { useState, useContext } from "react";
import FeederNav from "../../FeederNav/FeederNav";
import { FaRegPlusSquare } from "react-icons/fa";
import axios from "axios";
import { userContext } from "../../App";
import paperImg from "../../assets/images/paperCategory.png"
import glassImg from "../../assets/images/glassCategory.png"
import plasticImg from "../../assets/images/plasticCategory.png"
import otherImg from "../../assets/images/othersCategory.gif"
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import './custom.css'






const CreatePost = () => {

    const [title, setTitle] = useState();
    const [desc, setDescription] = useState();
    const [file, setFile] = useState();
    const [category, setCategory] = useState("paper"); // Set default category to "paper"
    const navigate = useNavigate()
    const userInformation = useContext(userContext);


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title || !desc || !file || !category) {
            // Show toast message for missing information
            toast.error('Please fill in all fields', { position: 'top-center' });
            return; // Prevent form submission
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', desc);
        formData.append('file', file);
        formData.append('email', userInformation.email);
        formData.append('id', userInformation.id);
        formData.append('username', userInformation.username);
        formData.append('category', category); // Include selected category in form data



        axios.post("http://localhost:3000/createPost", formData)
            .then(res => {
                console.log(res.data);
                if (res.data === "Success") {
                    navigate(`/profile/${userInformation.id}`)
                    toast.success('Post shared', { position: 'top-center' });

                } else {
                    toast.error('Post could not shared', { position: 'top-center' });

                }
            });
    };

    return (
        <div className="login-page h-screen">
            <FeederNav></FeederNav>

            <div className="max-w-md mx-auto mt-3 login-page bg-cover bg-center " >
                <form onSubmit={handleSubmit} className="bg-white rounded px-8 pt-6 pb-8 mb-4 shadow-xl">
                    <div className="mb-4">
                        <h2 className="text-center text-primary text-3xl font-bold">Create Post</h2>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Enter
                        </label>
                        <input
                            className="shadow-xl appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-primary focus:border-primary"
                            id="username"
                            type="text"
                            placeholder="Enter Title"
                            onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="desc">
                            Description
                        </label>
                        <textarea
                            className="shadow-xl appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
                            id="desc"
                            name="desc"
                            cols="30"
                            rows="10"
                            placeholder="Description"
                            onChange={(e) => setDescription(e.target.value)} ></textarea>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
                            Select File


                        </label>
                        <input
                            className="shadow-xl appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
                            id="file"
                            type="file"
                            name="file"
                            placeholder="Select File"
                            onChange={(e) => setFile(e.target.files[0])} />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2 focus:border-primary" htmlFor="category">
                            Select Category
                        </label>
                        <div className="relative">
                            <select
                                className="shadow-xl appearance-none border rounded w-40 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                id="category"
                                name="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}>
                                <option value="paper">Paper</option>
                                <option value="glass">Glass</option>
                                <option value="plastic">Plastic/Bottles</option>
                                <option value="others">Others</option>

                            </select>
                            {category && (
                                <img
                                    src={
                                        category === "paper"
                                            ? paperImg
                                            : category === "glass"
                                                ? glassImg
                                                : category === "plastic"
                                                    ? plasticImg
                                                    : category === "others" ? otherImg : ""

                                    }
                                    alt={category}
                                    className="absolute right-0 top-0 mt-0 mr-10 w-20"
                                    style={{ pointerEvents: "none" }} // Ensure the image doesn't interfere with the select box
                                />
                            )}

                        </div>

                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-primary hover:opacity-80 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit">
                            <FaRegPlusSquare size={30}></FaRegPlusSquare> Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
