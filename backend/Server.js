// server.js

const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise'); // Make sure to use 'promise' here
require('dotenv').config();
const router = express.Router();

const app = express();
// const PORT = process.env.PORT || 5000;

const cors = require('cors');



app.use(cors({
    origin: 'http://localhost:3000', // your frontend URL
    methods: ['GET', 'POST', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  }));


// Middleware
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createPool({
    host: '127.0.0.1',            // Use 127.0.0.1 instead of localhost
    user: 'root',                 // Replace with your username if needed
    password: 'my-secret-password', // Your password
    database: 'project',          // Your database name
    port: 3306                    // Define the port explicitly
});

// Check connection (optional, only for debugging)
(async () => {
    try {
        const connection = await db.getConnection(); // Get a connection from the pool
        console.log('Connected to MySQL Database');
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('Error connecting to MySQL Database:', err);
    }
})();


// Sample data endpoint
app.get('/data', (req, res) => {
    db.query('SELECT * FROM your_table', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// User authentication endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    console.log('Received login request:', req.body);

    if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    console.log('Querying database for user with email:', email);
    db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
        console.log('Query executed'); // After query
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        // Continue processing...
    });
        console.log('Database results:', results);
        if (results.length === 0) {
            console.log('No user found with this email');
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Password comparison error:', err);
                return res.status(500).json({ error: 'Error comparing passwords' });
            }
            if (!isMatch) {
                console.log('Password does not match');
                return res.status(401).json({ error: 'Invalid email or password.' });
            }

            console.log('User logged in successfully:', user.email);
            res.json({ message: 'Logged in successfully', user: { email: user.email } });
        });
    });

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Start server

// Add this below the existing routes in server.js

app.get('/plot', (req, res) => {
    db.query('SELECT * FROM your_table', (err, results) => {
        if (err) return res.status(500).json({ error: err });

        const xData = results.map(row => row.created_at);
        const yData = results.map(row => row.value);

        const plotData = [{
            x: xData,
            y: yData,
            type: 'scatter',
            mode: 'lines+markers',
            marker: { color: 'blue' },
        }];

        const plotLayout = {
            title: 'Data Visualization',
            xaxis: { title: 'Time' },
            yaxis: { title: 'Value' },
        };

        res.json({ data: plotData, layout: plotLayout });
    });
});

// Fetch transactions
app.get('/api/transactions', async (req, res) => {
    try {
        const [transactions] = await db.query('SELECT * FROM Transactions');
        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ error: 'No transactions found' });
        }
        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Error fetching transactions', details: error.message });
    }
});


app.get('/api/investments', async (req, res) => {
    try {
        const [investments] = await db.query('SELECT * FROM Investments');
        if (!investments || investments.length === 0) {
            return res.status(404).json({ error: 'No investments found' });
        }
        res.status(200).json(investments);
    } catch (error) {
        console.error('Error fetching investments:', error);
        res.status(500).json({ error: 'Error fetching investments', details: error.message });
    }
});

app.get('/api/goals', async (req, res) => {
    try {
        const [goals] = await db.query('SELECT * FROM Goals');
        if (!goals || goals.length === 0) {
            return res.status(404).json({ error: 'No goals found' });
        }
        res.status(200).json(goals);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ error: 'Error fetching goals', details: error.message });
    }
});


app.get('/api/budget', async (req, res) => {
    try {
        const [budget] = await db.query('SELECT * FROM Budgets');
        if (!budget || budget.length === 0) {
            return res.status(404).json({ error: 'No budget found' });
        }
        res.status(200).json(budget);
    } catch (error) {
        console.error('Error fetching budget:', error);
        res.status(500).json({ error: 'Error fetching budget', details: error.message });
    }
});


// API to update budget
app.put('/api/budget/:id', async (req, res) => {
    const budgetId = req.params.id; // Extract the budget ID from the URL
    const { amount, description } = req.body; // Extract new budget details from the request body

    // Check if required fields are present
    if (amount === undefined || description === undefined) {
        return res.status(400).json({ error: 'Amount and category are required' });
    }

    try {
        // Update budget in the database
        const [result] = await db.query('UPDATE Budgets SET amount = ?, category = ? WHERE budget_id = ?', [amount, category, budgetId]);

        // Check if the budget was found and updated
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.status(200).json({ message: 'Budget updated successfully' });
    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({ error: 'Error updating budget', details: error.message });
    }
});


app.listen(5700, () => {
    console.log(`Server is running on http://localhost:${5700}`);
});
