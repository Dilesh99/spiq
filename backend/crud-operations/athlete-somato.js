import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all somatotype records
router.get('/', /* authenticateToken, */ async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Somatotype');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get somatotype for a specific athlete
router.get('/:athlete_id', /* authenticateToken, */ async (req, res) => {
  try {
    const { athlete_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM Somatotype WHERE athlete_id = $1',
      [athlete_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Somatotype not found for this athlete' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Create a new somatotype record
router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const { athlete_id, endomorphy, mesomorphy, ectomorphy, type } = req.body;
    await pool.query(
      `INSERT INTO Somatotype (
         athlete_id,
         endomorphy,
         mesomorphy,
         ectomorphy,
         type
       ) VALUES ($1, $2, $3, $4, $5)`,
      [athlete_id, endomorphy, mesomorphy, ectomorphy, type]
    );
    return res.status(201).json({ message: 'Somatotype record created successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Update an existing somatotype record
router.put('/', /* authenticateToken, */ async (req, res) => {
  try {
    const { athlete_id, endomorphy, mesomorphy, ectomorphy, type } = req.body;
    const result = await pool.query(
      `UPDATE Somatotype SET
         endomorphy = $2,
         mesomorphy = $3,
         ectomorphy = $4,
         type       = $5
       WHERE athlete_id = $1`,
      [athlete_id, endomorphy, mesomorphy, ectomorphy, type]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Somatotype not found for this athlete' });
    }
    return res.json({ message: 'Somatotype record updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete a somatotype record
router.delete('/:athlete_id', /* authenticateToken, */ async (req, res) => {
  try {
    const { athlete_id } = req.params;
    const result = await pool.query(
      'DELETE FROM Somatotype WHERE athlete_id = $1',
      [athlete_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Somatotype not found for this athlete' });
    }
    return res.json({ message: 'Somatotype record deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
