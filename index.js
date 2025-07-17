
const express = require('express');
const dotenv = require('dotenv')
const ConnectionDB = require('./utils/connectionDB');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes')
dotenv.config();
const cookieParser = require('cookie-parser');
const app = express();

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
    origin: allowedOrigin,                 // your React app URL
    credentials: true,                     // allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());

ConnectionDB();

app.get('/', (req, res) => {
    res.send("API is running on this port")
})

app.use('/api', authRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
