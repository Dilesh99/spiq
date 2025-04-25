import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all triple jump performance entries
router.get('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Sport_TripleJump');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get triple jump records for a specific athlete
router.get('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT * FROM Sport_TripleJump WHERE athlete_id = $1', [athlete_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sport triple jump record not found for this athlete' });
        }
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create a new triple jump record
router.post('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id, age, output } = req.body;

        await pool.query(`
            INSERT INTO Sport_TripleJump (athlete_id, age, output)
            VALUES ($1, $2, $3)
        `, [athlete_id, age, output]);

        return res.status(201).json({ message: 'Sport triple jump record created successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update a triple jump record
router.put('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id, age, output, update_count } = req.body;

        await pool.query(`
            UPDATE Sport_TripleJump
            SET age = $2,
                output = $3,
                update_count = $4
            WHERE athlete_id = $1
        `, [athlete_id, age, output, update_count]);

        return res.json({ message: 'Sport triple jump record updated successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete a triple jump record
router.delete('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        await pool.query('DELETE FROM Sport_TripleJump WHERE athlete_id = $1', [athlete_id]);
        return res.json({ message: 'Sport triple jump record deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
