const express = require('express');
const app = express();
var cors = require('cors');
require('dotenv').config();
const { userAuth } = require('./middlewares/auth');
const cookieParser = require('cookie-parser');
const User = require('./models/user');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');
const connectDB = require('./config/database');
const {startWeeklyReportsScheduler} = require('./helpers/reports');
const httpLogger =  require("./middlewares/httpLogger");
const logger = require("./config/logger");

logger.info("Application initialization started");
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

app.use(httpLogger);

app.use(cors({
  origin: process.env.WHITE_LISTED_URLS?.split(',') || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/profile',userAuth, profileRoutes);
app.use('/request', userAuth, requestRoutes);
app.use('/user', userAuth, userRoutes); 
app.use('/payment', paymentRoutes);


connectDB().then(() => {
  logger.info("Database connection established");

  app.listen(process.env.PORT || 3000, () => {
    const port = process.env.PORT || 3000;
    logger.info({ port }, "Server listening");
  });
  startWeeklyReportsScheduler();
  logger.info("Weekly reports scheduler started");
}).catch((err) => {
  logger.error({ err }, "Database connection failed");
});
