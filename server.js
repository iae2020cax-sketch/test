// server.js
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory "blockchain" array
let blockchain = [];

// Helper to create a hash (simulate blockchain storage)
function createHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Register route
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const data = `${username}:${password}:${Date.now()}`;
  const hash = createHash(data);

  // Store in blockchain
  blockchain.push({ username, hash, timestamp: Date.now() });
  res.send('Registration successful! You can now login.');
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const userRecord = blockchain.find(b => b.username === username);
  if (!userRecord) {
    return res.send('User not found.');
  }
  const data = `${username}:${password}:${userRecord.timestamp}`;
  const hash = createHash(data);
  if (hash === userRecord.hash) {
    res.send('Login successful!');
  } else {
    res.send('Invalid credentials.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
