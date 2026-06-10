
const mongoose = require('mongoose')




 async function connectMDB (){    
    try{
        const Mdb = await mongoose.connect(process.env.MONGO_URI)
          console.log("MongoDB Connected (MDB)");
    }
    catch (error){
          console.log(error)
    }
}

module.exports = connectMDB