// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reservationRoutes = require('./routes/ReservationRoutes');

const app = express();

// Handle the MaxListenersExceededWarning
require('events').EventEmitter.defaultMaxListeners = 15;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/reservations', reservationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.info('SIGINT signal received.');
    process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = server;