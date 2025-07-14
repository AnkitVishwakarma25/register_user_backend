const mongoose = require('mongoose')



const ConnectionDB = async () => {

   try {

      await mongoose.connect(process.env.MONGO_URL);
      console.log('mongoDB connected ');

   } catch (error) {
      console.error('MongoDB Connection failed ', error.message);
      process.exit(1)
   }

}
module.exports = ConnectionDB;