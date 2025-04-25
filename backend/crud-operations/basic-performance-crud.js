import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all basic performance entries
router.get('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM BasicPerformance');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get basic performance for a specific athlete
router.get('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT * FROM BasicPerformance WHERE athlete_id = $1', [athlete_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Performance record not found for this athlete' });
        }
        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create a new basic performance record
router.post('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const {
            athlete_id,
            time_30m,
            time_100m,
            standing_long_jump,
            vertical_jump,
            beep_test,
            sit_and_reach,
            reaction_time,
            grip_strength
        } = req.body;

        await pool.query(`
            INSERT INTO BasicPerformance (
                athlete_id, time_30m, time_100m, standing_long_jump, vertical_jump,
                beep_test, sit_and_reach, reaction_time, grip_strength
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        `, [
            athlete_id, time_30m, time_100m, standing_long_jump, vertical_jump,
            beep_test, sit_and_reach, reaction_time, grip_strength
        ]);

        return res.status(201).json({ message: 'Performance record created successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update basic performance record
router.put('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const {
            athlete_id,
            time_30m,
            time_100m,
            standing_long_jump,
            vertical_jump,
            beep_test,
            sit_and_reach,
            reaction_time,
            grip_strength
        } = req.body;

        await pool.query(`
            UPDATE BasicPerformance SET
                time_30m = $2,
                time_100m = $3,
                standing_long_jump = $4,
                vertical_jump = $5,
                beep_test = $6,
                sit_and_reach = $7,
                reaction_time = $8,
                grip_strength = $9
            WHERE athlete_id = $1
        `, [
            athlete_id, time_30m, time_100m, standing_long_jump, vertical_jump,
            beep_test, sit_and_reach, reaction_time, grip_strength
        ]);

        return res.json({ message: 'Performance record updated successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete a performance record
router.delete('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        await pool.query('DELETE FROM BasicPerformance WHERE athlete_id = $1', [athlete_id]);
        return res.json({ message: 'Performance record deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
