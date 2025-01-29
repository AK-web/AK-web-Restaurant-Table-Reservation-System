const express = require('express');
const router = express.Router();
const { 
    reserveTable,
    getReservationsByEmail,
    getAllReservations,
    cancelReservation,
    modifyReservationTime
} = require('../controllers/ReservationController');

//routes
router.post('/reserve', reserveTable);
router.get('/user/:email', getReservationsByEmail);
router.get('/all', getAllReservations);
router.post('/cancel', cancelReservation);
router.put('/modify', modifyReservationTime);

module.exports = router;