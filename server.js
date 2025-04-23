require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// CORS setup: allow your frontend origin
app.use(cors({
  origin: 'https://nawarzaki.github.io',
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Schemas
const adminSchema = new mongoose.Schema({ username: String, password: String });
const postSchema = new mongoose.Schema({
  section: { type: String, enum: ['section1','section2','section3'], required: true },
  title: { type: String, required: true },
  content: String,
  images: [String],
  createdAt: { type: Date, default: Date.now }
});
const Admin = mongoose.model('Admin', adminSchema);
const Post = mongoose.model('Post', postSchema);

// Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Auth middleware
function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.sendStatus(401);
  const token = auth.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, admin) => {
    if (err) return res.sendStatus(403);
    req.admin = admin;
    next();
  });
}

// Routes

// 1. Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
  if (!await bcrypt.compare(password, admin.password))
    return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: admin._id, username }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// 2. Create/Post
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 3. Read all
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// 4. Update
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 5. Delete
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// 6. Image upload
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// 404 for other API
app.use('/api/*', (req, res) => res.status(404).json({ message: 'Not Found' }));

// Start
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
