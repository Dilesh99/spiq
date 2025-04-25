import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all 200m sport performance entries
router.get('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Sport_200m');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get sport 200m performance for a specific athlete
router.get('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT * FROM Sport_200m WHERE athlete_id = $1', [athlete_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Sport 200m record not found for this athlete' });
        }
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create a new 200m sport record
router.post('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id, age, output } = req.body;

        await pool.query(`
            INSERT INTO Sport_200m (athlete_id, age, output)
            VALUES ($1, $2, $3)
        `, [athlete_id, age, output]);

        return res.status(201).json({ message: 'Sport 200m record created successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update 200m sport record
router.put('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id, age, output, update_count } = req.body;

        await pool.query(`
            UPDATE Sport_200m
            SET age = $2,
                output = $3,
                update_count = $4
            WHERE athlete_id = $1
        `, [athlete_id, age, output, update_count]);

        return res.json({ message: 'Sport 200m record updated successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete 200m sport record
router.delete('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        await pool.query('DELETE FROM Sport_200m WHERE athlete_id = $1', [athlete_id]);
        return res.json({ message: 'Sport 200m record deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
