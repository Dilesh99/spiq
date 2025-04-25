import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all model outputs
router.get('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ModelOutput');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get specific model output by athlete_id
router.get('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT * FROM ModelOutput WHERE athlete_id = $1', [athlete_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Model output not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new model output
router.post('/', async (req, res) => {
    try {
        const { athlete_id, age, output_text } = req.body;
        await pool.query(
            'INSERT INTO ModelOutput (athlete_id, age, output_text) VALUES ($1, $2, $3)',
            [athlete_id, age, output_text]
        );
        res.status(201).json({ message: 'Model output created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update existing model output
router.put('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id, age, output_text } = req.body;
        await pool.query(
            'UPDATE ModelOutput SET age = $2, output_text = $3 WHERE athlete_id = $1',
            [athlete_id, age, output_text]
        );
        res.json({ message: 'Model output updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a model output
router.delete('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        await pool.query('DELETE FROM ModelOutput WHERE athlete_id = $1', [athlete_id]);
        res.json({ message: 'Model output deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
