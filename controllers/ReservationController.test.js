const reservationController = require('../controllers/ReservationController');
const { tables, reservations, Reservation } = require('../Models/Table');

// Mock data for testing
jest.mock('../Models/Table', () => ({
    tables: [
        { id: 1, capacity: 4 },
        { id: 2, capacity: 6 },
        { id: 3, capacity: 2 },
    ],
    reservations: [],
    Reservation: jest.fn().mockImplementation(function (id, name, email, guests, dateTime, tableId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.guests = guests;
        this.dateTime = dateTime;
        this.tableId = tableId;
    }),
}));

// Test the findAvailableTable method
describe('findAvailableTable', () => {
    it('should find an available table for guests', () => {
        const availableTable = reservationController.findAvailableTable(4, '2025-01-30T12:00:00');
        expect(availableTable).toBeDefined();
        expect(availableTable.capacity).toBeGreaterThanOrEqual(4);
    });

    it('should return null if no available table is found', () => {
        reservationController.reservations.push({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            guests: 4,
            dateTime: '2025-01-30T12:00:00',
            tableId: 1,
        });
        const availableTable = reservationController.findAvailableTable(4, '2025-01-30T12:00:00');
        expect(availableTable).toBeNull();
    });
});

// Test the reserveTable method
describe('reserveTable', () => {
    let req, res;

    beforeEach(() => {
        req = { body: { name: 'John Doe', email: 'john@example.com', guests: 4, dateTime: '2025-01-30T12:00:00' } };
        res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn().mockReturnThis() 
        };
    });

    it('should reserve a table successfully', async () => {
        const availableTable = reservationController.findAvailableTable(4, '2025-01-30T12:00:00');
        jest.spyOn(reservationController, 'findAvailableTable').mockReturnValue(availableTable);
        await reservationController.reserveTable(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Reservation confirmed',
            reservation: expect.objectContaining({
                name: 'John Doe',
                tableNumber: expect.any(Number),
            })
        }));
    });

    it('should return an error if missing required fields', async () => {
        req.body = {}; // Empty request body
        await reservationController.reserveTable(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });

    it('should return an error if email format is invalid', async () => {
        req.body.email = 'invalid-email';
        await reservationController.reserveTable(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email format' });
    });

    it('should return an error if no tables are available', async () => {
        jest.spyOn(reservationController, 'findAvailableTable').mockReturnValue(null);
        await reservationController.reserveTable(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'No tables available for the specified time and party size' });
    });
});

// Test the getReservationsByEmail method
describe('getReservationsByEmail', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { email: 'john@example.com' } };
        res = { 
            status: jest.fn().mockReturnThis(), 
            json: jest.fn().mockReturnThis() 
        };
    });

    it('should return reservations for a specific email', async () => {
        reservations.push({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            guests: 4,
            dateTime: '2025-01-30T12:00:00',
            tableId: 1,
        });

        await reservationController.getReservationsByEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Reservations found',
            reservations: expect.arrayContaining([expect.objectContaining({
                email: 'john@example.com',
                tableNumber: expect.any(Number),
            })])
        }));
    });

    it('should return an error if no reservations are found', async () => {
        await reservationController.getReservationsByEmail(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'No reservations found for this email' });
    });
});
