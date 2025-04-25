import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

// Get all athlete stats
router.get('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM AthleteStats');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get stats for a specific athlete
router.get('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT * FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Stats not found for this athlete' });
        }
        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create athlete stats
router.post('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const {
            athlete_id,
            bmi,
            power_to_weight,
            vo2_max,
            speed_index,
            power_output,
            sprint_fatigue_index,
            jumping_power,
            grip_index,
            neuromuscular_efficiency,
            flexibility_index
        } = req.body;

        await pool.query(`
            INSERT INTO AthleteStats (
                athlete_id, bmi, power_to_weight, vo2_max, speed_index,
                power_output, sprint_fatigue_index, jumping_power,
                grip_index, neuromuscular_efficiency, flexibility_index
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        `, [
            athlete_id, bmi, power_to_weight, vo2_max, speed_index,
            power_output, sprint_fatigue_index, jumping_power,
            grip_index, neuromuscular_efficiency, flexibility_index
        ]);

        return res.status(201).json({ message: 'Athlete stats created successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update athlete stats
router.put('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const {
            athlete_id,
            bmi,
            power_to_weight,
            vo2_max,
            speed_index,
            power_output,
            sprint_fatigue_index,
            jumping_power,
            grip_index,
            neuromuscular_efficiency,
            flexibility_index
        } = req.body;

        await pool.query(`
            UPDATE AthleteStats SET
                bmi = $2,
                power_to_weight = $3,
                vo2_max = $4,
                speed_index = $5,
                power_output = $6,
                sprint_fatigue_index = $7,
                jumping_power = $8,
                grip_index = $9,
                neuromuscular_efficiency = $10,
                flexibility_index = $11
            WHERE athlete_id = $1
        `, [
            athlete_id, bmi, power_to_weight, vo2_max, speed_index,
            power_output, sprint_fatigue_index, jumping_power,
            grip_index, neuromuscular_efficiency, flexibility_index
        ]);

        return res.json({ message: 'Athlete stats updated successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete athlete stats
router.delete('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        await pool.query('DELETE FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);
        return res.json({ message: 'Athlete stats deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
