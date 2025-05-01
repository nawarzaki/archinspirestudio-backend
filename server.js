const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Simple API route to test server
app.get('/', (req, res) => {
  res.send('Backend is working!');
});

// 🛠️ New: Login Route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Hardcoded login for now
  if (username === 'admin' && password === 'admin123') {
    return res.json({ token: 'your-token-here' });
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

let posts = []; // Temporary in-memory post storage

app.post('/api/posts', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Missing title or content' });

  const newPost = { title, content };
  posts.push(newPost);
  res.status(201).json({ message: 'Post created', post: newPost });
});

app.get('/api/posts', (req, res) => {
  res.json(posts);
});


// Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const Subsection = require('./models/Subsection');

// Create
app.post('/api/subsections', async (req, res) => {
  try {
    const sub = new Subsection(req.body);
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all
app.get('/api/subsections', async (req, res) => {
  const subs = await Subsection.find().sort({ createdAt: -1 });
  res.json(subs);
});

// Update
app.put('/api/subsections/:id', async (req, res) => {
  try {
    const updated = await Subsection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete
app.delete('/api/subsections/:id', async (req, res) => {
  try {
    await Subsection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

