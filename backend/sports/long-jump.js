import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all long jump performance entries
router.get('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Sport_LongJump');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get long jump records for a specific athlete
router.get('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT * FROM Sport_LongJump WHERE athlete_id = $1', [athlete_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sport long jump record not found for this athlete' });
        }
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create a new long jump record
router.post('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id, age, output } = req.body;

        await pool.query(`
            INSERT INTO Sport_LongJump (athlete_id, age, output)
            VALUES ($1, $2, $3)
        `, [athlete_id, age, output]);

        return res.status(201).json({ message: 'Sport long jump record created successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update a long jump record
router.put('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id, age, output, update_count } = req.body;

        await pool.query(`
            UPDATE Sport_LongJump
            SET age = $2,
                output = $3,
                update_count = $4
            WHERE athlete_id = $1
        `, [athlete_id, age, output, update_count]);

        return res.json({ message: 'Sport long jump record updated successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete a long jump record
router.delete('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        await pool.query('DELETE FROM Sport_LongJump WHERE athlete_id = $1', [athlete_id]);
        return res.json({ message: 'Sport long jump record deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
