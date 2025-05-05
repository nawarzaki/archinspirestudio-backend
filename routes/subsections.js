const express = require('express');
const router = express.Router();
const Subsection = require('../models/Subsection');

// Create a new subsection
router.post('/api/subsections', async (req, res) => {
  try {
    const sub = new Subsection(req.body);
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Read all subsections
router.get('/api/subsections', async (req, res) => {
  const subs = await Subsection.find().sort({ createdAt: -1 });
  res.json(subs);
});

// Update a subsection
router.put('/api/subsections/:id', async (req, res) => {
  try {
    const updated = await Subsection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a subsection
router.delete('/api/subsections/:id', async (req, res) => {
  try {
    await Subsection.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
