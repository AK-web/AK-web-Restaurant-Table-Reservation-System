# AK-web-Restaurant-Table-Reservation-System

## 🚀 Features
- Find available tables based on the number of guests
- Make a reservation
- Retrieve reservations by email
- Basic validation for reservations
- Unit tests using **Jest**

---

## 📂 Project Setup

### 1️⃣ Clone the Repository
```sh
git clone origin https://github.com/AK-web/AK-web-Restaurant-Table-Reservation-System.git
cd AK-web-Restaurant-Table-Reservation-System
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Start the Server
```sh
npm run dev
```
The server will start on `http://localhost:3000`.

---

## 📌 API Endpoints

**POST** `http://localhost:3000/api/reservations/reserve`  
**GET** `http://localhost:3000/api/reservations/user/:email`  
**GET** `http://localhost:3000/api/reservations/all`  
**DELETE** `http://localhost:3000/api/reservations/cancel`  
**PUT** `http://localhost:3000/api/reservations/modify`  

---

## 🧪 Running Tests
This project includes unit tests using **Jest**. To run the tests, use:
```sh
npm test
```

### ✅ Test Cases
- ✔️ Should find an available table
- ✔️ Should return null if no tables are available
- ✔️ Should successfully reserve a table
- ✔️ Should return an error for invalid email format
- ✔️ Should return reservations for a specific email
- ✔️ Should return an error if no reservations are found

---

## 📌 GitHub Setup
To push this project to GitHub:
```sh
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/AK-web/AK-web-Restaurant-Table-Reservation-System.git
git push -u origin main
```

---

## 📌 Future Improvements
- Add a database (MongoDB or PostgreSQL) for persistent storage
- Implement authentication
- Add UI for booking tables

---

