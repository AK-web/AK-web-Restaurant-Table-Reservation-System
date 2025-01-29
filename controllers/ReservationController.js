const { tables, reservations, Reservation } = require('../Models/Table');

// Create controller object to store all methods
const reservationController = {
    // Find available table helper function
    findAvailableTable: (guests, dateTime) => {
        const reservationTime = new Date(dateTime);
        
        const overlappingReservations = reservations.filter(reservation => {
            const existingTime = new Date(reservation.dateTime);
            const timeDiff = Math.abs(existingTime - reservationTime) / (1000 * 60 * 60);
            return timeDiff < 2;
        });

        const reservedTableIds = overlappingReservations.map(res => res.tableId);

        return tables.find(table => 
            table.capacity >= guests && 
            !reservedTableIds.includes(table.id)
        );
    },

    // Reserve table endpoint
    reserveTable: async (req, res) => {
        try {
            const { name, email, guests, dateTime } = req.body;

            if (!name || !email || !guests || !dateTime) {
                return res.status(400).json({ 
                    error: 'Missing required fields' 
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    error: 'Invalid email format' 
                });
            }

            if (guests < 1 || guests > 8) {
                return res.status(400).json({ 
                    error: 'Number of guests must be between 1 and 8' 
                });
            }

            const reservationDate = new Date(dateTime);
            if (isNaN(reservationDate.getTime())) {
                return res.status(400).json({ 
                    error: 'Invalid date/time format' 
                });
            }

            if (reservationDate < new Date()) {
                return res.status(400).json({ 
                    error: 'Reservation time must be in the future' 
                });
            }

            const availableTable = reservationController.findAvailableTable(guests, dateTime);
            
            if (!availableTable) {
                return res.status(400).json({ 
                    error: 'No tables available for the specified time and party size' 
                });
            }

            const reservation = new Reservation(
                Date.now(),
                name,
                email,
                guests,
                dateTime,
                availableTable.id
            );

            reservations.push(reservation);

            return res.status(201).json({
                message: 'Reservation confirmed',
                reservation: {
                    id: reservation.id,
                    name: reservation.name,
                    tableNumber: reservation.tableId,
                    guests: reservation.guests,
                    dateTime: reservation.dateTime
                }
            });

        } catch (error) {
            console.error('Reservation error:', error);
            return res.status(500).json({ 
                error: 'Internal server error' 
            });
        }
    },

    // Get reservations by email endpoint
    getReservationsByEmail: async (req, res) => {
        try {
            const { email } = req.params;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    error: 'Invalid email format' 
                });
            }

            const userReservations = reservations
                .filter(reservation => reservation.email === email)
                .map(reservation => ({
                    id: reservation.id,
                    name: reservation.name,
                    tableNumber: reservation.tableId,
                    guests: reservation.guests,
                    dateTime: reservation.dateTime,
                    table: tables.find(table => table.id === reservation.tableId)
                }))
                .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

            if (userReservations.length === 0) {
                return res.status(404).json({
                    message: 'No reservations found for this email'
                });
            }

            return res.status(200).json({
                message: 'Reservations found',
                reservations: userReservations
            });

        } catch (error) {
            console.error('Get reservations error:', error);
            return res.status(500).json({ 
                error: 'Internal server error' 
            });
        }
    },

    // Get all reservations endpoint
    getAllReservations: async (req, res) => {
        try {
            const { date } = req.query;

            if (!date) {
                return res.status(400).json({
                    error: 'Date parameter is required (YYYY-MM-DD)'
                });
            }

            const queryDate = new Date(date);
            if (isNaN(queryDate.getTime())) {
                return res.status(400).json({
                    error: 'Invalid date format. Please use YYYY-MM-DD'
                });
            }

            const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

            const dateReservations = reservations
                .filter(reservation => {
                    const reservationDate = new Date(reservation.dateTime);
                    return reservationDate >= startOfDay && reservationDate <= endOfDay;
                })
                .map(reservation => ({
                    id: reservation.id,
                    name: reservation.name,
                    email: reservation.email,
                    guests: reservation.guests,
                    tableNumber: reservation.tableId,
                    dateTime: reservation.dateTime,
                    table: tables.find(table => table.id === reservation.tableId)
                }))
                .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

            return res.status(200).json({
                message: 'Reservations retrieved successfully',
                date: date,
                totalReservations: dateReservations.length,
                reservations: dateReservations
            });

        } catch (error) {
            console.error('Get all reservations error:', error);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    },

    // Cancel reservation endpoint
    cancelReservation: async (req, res) => {
        try {
            const { email, dateTime } = req.body;

            if (!email || !dateTime) {
                return res.status(400).json({
                    error: 'Email and dateTime are required'
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Invalid email format'
                });
            }

            const reservationDateTime = new Date(dateTime);
            if (isNaN(reservationDateTime.getTime())) {
                return res.status(400).json({
                    error: 'Invalid dateTime format'
                });
            }

            const reservationIndex = reservations.findIndex(reservation => 
                reservation.email === email &&
                new Date(reservation.dateTime).getTime() === reservationDateTime.getTime()
            );

            if (reservationIndex === -1) {
                return res.status(404).json({
                    error: 'Reservation not found'
                });
            }

            const currentTime = new Date();
            const timeDiff = (reservationDateTime - currentTime) / (1000 * 60 * 60);

            if (timeDiff < 1) {
                return res.status(400).json({
                    error: 'Reservations must be cancelled at least 1 hour in advance'
                });
            }

            const cancelledReservation = reservations[reservationIndex];
            reservations.splice(reservationIndex, 1);

            return res.status(200).json({
                message: 'Reservation cancelled successfully',
                cancelledReservation: {
                    name: cancelledReservation.name,
                    email: cancelledReservation.email,
                    guests: cancelledReservation.guests,
                    dateTime: cancelledReservation.dateTime,
                    tableNumber: cancelledReservation.tableId
                }
            });

        } catch (error) {
            console.error('Cancel reservation error:', error);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    },

    modifyReservationTime: async (req, res) => {
        try {
            const { 
                email, 
                currentDateTime,
                newDateTime 
            } = req.body;

            // Input validation
            if (!email || !currentDateTime || !newDateTime) {
                return res.status(400).json({
                    error: 'Email, current date/time, and new date/time are required'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Invalid email format'
                });
            }

            // Convert date strings to Date objects
            const currentTime = new Date(currentDateTime);
            const newTime = new Date(newDateTime);
            const now = new Date();

            // Validate date formats
            if (isNaN(currentTime.getTime()) || isNaN(newTime.getTime())) {
                return res.status(400).json({
                    error: 'Invalid date/time format'
                });
            }

            // Check if new time is in the future
            if (newTime <= now) {
                return res.status(400).json({
                    error: 'New reservation time must be in the future'
                });
            }

            // Find the existing reservation
            const reservationIndex = reservations.findIndex(reservation => 
                reservation.email === email &&
                new Date(reservation.dateTime).getTime() === currentTime.getTime()
            );

            if (reservationIndex === -1) {
                return res.status(404).json({
                    error: 'Reservation not found'
                });
            }

            const existingReservation = reservations[reservationIndex];

            // Check if modification is at least 1 hour before current reservation
            const timeUntilReservation = (currentTime - now) / (1000 * 60 * 60); // hours
            if (timeUntilReservation < 1) {
                return res.status(400).json({
                    error: 'Reservations can only be modified at least 1 hour before the current reservation time'
                });
            }

            // Check if new time slot is available
            const availableTable = reservationController.findAvailableTable(
                existingReservation.guests,
                newDateTime
            );

            if (!availableTable) {
                return res.status(400).json({
                    error: 'No tables available for the requested new time'
                });
            }

            // Update the reservation
            const updatedReservation = {
                ...existingReservation,
                dateTime: newDateTime,
                tableId: availableTable.id
            };

            // Replace old reservation with updated one
            reservations[reservationIndex] = updatedReservation;

            return res.status(200).json({
                message: 'Reservation time modified successfully',
                previousReservation: {
                    dateTime: currentDateTime,
                    tableNumber: existingReservation.tableId
                },
                newReservation: {
                    id: updatedReservation.id,
                    name: updatedReservation.name,
                    email: updatedReservation.email,
                    guests: updatedReservation.guests,
                    dateTime: updatedReservation.dateTime,
                    tableNumber: updatedReservation.tableId
                }
            });

        } catch (error) {
            console.error('Modify reservation error:', error);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
};

module.exports = reservationController;