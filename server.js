const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./configs/dbConnections');
const analyticsRoutes = require('./routes/analyticsRoutes');
const path = require("path");
dotenv.config();
connectDb();
app.use(cors());

app.use(express.json());

app.use('/api', analyticsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));