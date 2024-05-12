const mongoose = require('mongoose')
 
const connectDB = async () => {

    try {
        await mongoose.connect(process.env.URL)
        console.log(`Connected to db`)

    }catch(err) {
        console.log(err)
        process.exit(0);
    }
}

module.exports = connectDB
