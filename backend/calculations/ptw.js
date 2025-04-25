import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.put('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT vertical_jump, weight FROM measurements INNER JOIN BasicPerformance ON measurements.athlete_id = BasicPerformance.athlete_id WHERE measurements.athlete_id = $1', [athlete_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlete not found' });
        }

        const { vertical_jump, weight } = result.rows[0];

        // Check if vertical_jump and weight are available
        if (!vertical_jump || !weight) {
            return res.status(400).json({ error: 'Insufficient data to calculate PWR' });
        }

        // Calculate the Power-to-Weight Ratio (PWR)
        const pwr = ((vertical_jump / 100) * 9.81) / weight; // Convert vertical_jump from cm to meters

        // Check if the athlete already has a record in AthleteStats
        const athleteStatsResult = await pool.query('SELECT * FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);

        if (athleteStatsResult.rows.length > 0) {
            await pool.query('UPDATE AthleteStats SET power_to_weight = $1 WHERE athlete_id = $2', [pwr, athlete_id]);
            return res.json({ athlete_id, pwr, message: 'PWR updated successfully' });
        } else {
            await pool.query('INSERT INTO AthleteStats (athlete_id, power_to_weight) VALUES ($1, $2)', [athlete_id, pwr]);
            return res.json({ athlete_id, pwr, message: 'PWR added successfully' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;

