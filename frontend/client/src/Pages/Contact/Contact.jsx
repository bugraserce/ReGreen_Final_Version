import Navbar from "../../Navbar.jsx/Navbar"
import "./Contact.css"; 
import contactImage from "./contact.png";
import './custom.css'
const Contact = () => {
  return (
    
    <div className="contact-container login-page">
      <Navbar />
      <div className="contact-content h-[90vh]">
        <div className="leftside flex justify-center flex-col">
          <h2 className="text-primary">Contact Us</h2>
          <p>
            We're here to help! If you have any questions, feedback, or encounter any issues with the Regreen Project, feel free to contact us at <a href="mailto:regreencontact@gmail.com">regreencontact@gmail.com</a>.
          </p>
        </div>
        <div className="rightside flex items-center shadow">
          <img src={contactImage} alt="Contact Us" className="rounded" />
        </div>
      </div>
    </div>
  )
}

export default Contact