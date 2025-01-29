class Table {
    constructor(id, capacity, isAvailable = true) {
        this.id = id;
        this.capacity = capacity;
        this.isAvailable = isAvailable;
    }
}

class Reservation {
    constructor(id, name, email, guests, dateTime, tableId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.guests = guests;
        this.dateTime = dateTime;
        this.tableId = tableId;
    }
}

// In-memory storage (replace with actual database in production)
const tables = [
    new Table(1, 2),
    new Table(2, 4),
    new Table(3, 4),
    new Table(4, 6),
    new Table(5, 8)
];

const reservations = [];

module.exports = {
    Table,
    Reservation,
    tables,
    reservations
};