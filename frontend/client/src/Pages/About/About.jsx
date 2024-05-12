import Navbar from "../../Navbar.jsx/Navbar";
import React, { useState } from "react";
import database from './database.png';
import img1 from './image-1.jpg';
import img2 from './image-2.jpg';
import img3 from './image-3.png';
import socialMedia from './socialMedia.png'
import { useNavigate } from "react-router-dom";

const About = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="grid-cols-2">
      <Navbar />
      <div className='bg-white py-16 px-4 login-page h-[40vh] items-center flex'>
        <div className='max-w-7xl mx-auto'>
          <div className=''>
            <p className='text-primary font-bold text-xl'>Think Green but</p>
            <h1 className='text-4xl font-bold py-2'>What is ReGreen?</h1>
            <p className='text-gray-800 text-xl'>
              At ReGreen, we believe in the power of digital sustainability. Our journey began with a simple mission: to create a platform that not only educates and inspires people about recycling but also practices what it preaches in the digital realm.
              We are a vibrant community of environmental enthusiasts where you can share posts about recycling, sustainability tips, and eco-friendly practices. Engage with informative content shared by others and stay updated on the latest trends and innovations in environmental conservation to make our earth ReGreen again.
            </p>
          </div>
        </div>
      </div>

      
      <div className='bg-primary py-16 px-4 flex justify-center grid-cols-2'>

       
        <div className='max-w-7xl mx-auto  md:grid-cols-2 gap-8  flex flex-col w-1/3'>
         

          <h1 className='text-3xl font-bold'>How we try to achieve our aims?</h1>
            <p className='text-gray-200 text-xl'>
              We are committed to promoting environmental sustainability not only through our content but also through our digital practices. We recognize the environmental impact of digital technologies, and we strive to minimize our footprint wherever possible.
            </p>
            <img src={database} alt="Database" className=' md:h-auto rounded-xl w-[500px]' />

            <span className="font-bold text-2xl text-gray-200">Delete Data</span> <p className="text-white text-xl">One of the ways we practice digital sustainability is by deleting unnecessary data from our database. When a user deletes something on our webpage, we also delete it from our database. This ensures that we only store what is necessary, reducing energy consumption and server load.
              We regularly review and optimize our database structure to eliminate redundant data and streamline operations, further minimizing our environmental footprint.
             We understand that databases consume electricity and other resources, and by minimizing the data stored, we reduce our environmental impact.</p> 
             <img src={img1} alt="img1" className=' md:h-auto rounded-xl w-[500px]' />
        </div>
            <div className=" max-w-7xl mx-auto  md:grid-cols-2 gap-8 text-3xl  flex flex-col w-1/3 ">
              <div className='text-white text-xl '>
            
            <ul className='text-gray-200 mt-4 space-y-2'>
            
                  <p className="text-center text-3xl font-bold text-black mb-10"> We are concious about</p>
              <li className="mb-8">
                <span className="font-bold text-2xl">Energy Efficiency</span> <p className="text-white text-xl">Every byte of data stored in a database requires energy for storage, retrieval, and maintenance.</p> 
                <img src={img3} alt="img3" className=' md:h-auto rounded-xl w-[500px] mt-8' />
              </li>
              <li className="mb-8">
                <span className="font-bold text-2xl ">Resource Conservation</span><p className="text-white text-xl">Databases require physical hardware and infrastructure to operate, including servers, cooling systems, and electricity.</p> 
              </li>
              <li className="mb-8" >
                <span className="font-bold text-2xl ">Cost Reduction</span><p className="text-white text-xl">Storing large amounts of data in a database can incur significant costs, including hardware expenses, electricity bills, and maintenance costs.</p> 
                <img src={img2} alt="img2" className=' md:h-auto rounded-xl w-[500px] mt-8' />
              </li>
              <li className="mb-8">
                <span className="font-bold text-2xl ">Performance Optimization</span><p className="text-white text-xl">Databases perform better when they contain only relevant and essential data.</p> 
              </li>
              <li className="mb-8">
                <span className="font-bold text-2xl ">Data Privacy and Security</span> <p className="text-white text-xl">Keeping the database clean helps mitigate the risk of data breaches and unauthorized access.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

     
      
      <div className='bg-white py-16 px-4 login-page h-[50vh] flex justify-center grid-cols-2'>
        <div className='w-1/3'>
          <div className='text-center'>
            <p className='text-primary font-bold'>To think Green</p>
            <h1 className='text-4xl font-bold py-2'>Joining Our Social Media Community</h1>
            <p className='text-gray-800 text-xl'>
              Connect with like-minded individuals from around the world who share your passion for recycling and environmental sustainability. Exchange ideas, share experiences, and collaborate on projects that promote positive change in your communities and beyond.
            </p>
            <button onClick={() => navigate('/register')} className='bg-primary text-white mt-6 px-6 py-3 rounded-md font-medium transition duration-300 hover:opacity-80'>Get Started</button>
          </div>
          
          
        </div>
        <div>
        <img className=" md:h-auto rounded-xl w-[500px] mt-8 " src={socialMedia} alt="" />
        </div>
      </div>
    </div>
  );
};

export default About;
