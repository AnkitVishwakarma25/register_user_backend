
const express = require('express');
const dotenv = require('dotenv')
const ConnectionDB = require('./utils/connectionDB');

const authRoutes = require('./routes/authRoutes')
dotenv.config();

const app = express();
app.use(express.json());

ConnectionDB();

app.get('/', (req, res) => {
    res.send("API is running on this port")
})

app.use('/api', authRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
