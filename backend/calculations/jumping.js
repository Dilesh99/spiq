import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.put('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        
        const result = await pool.query('SELECT weight, vertical_jump FROM measurements INNER JOIN BasicPerformance ON measurements.athlete_id = BasicPerformance.athlete_id WHERE measurements.athlete_id = $1', [athlete_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlete not found' });
        }

        const { weight, vertical_jump } = result.rows[0];
        console.debug('Weight:', weight);
        console.debug('Vertical Jump Height:', vertical_jump);

        // Check if weight and vertical jump height are available
        if (weight == null || vertical_jump == null) {
            return res.status(400).json({ error: 'Insufficient data to calculate Jumping Power' });
        }

        // Calculate peak power output using the simplified formula: P_peak = (m * g * h) / 0.2
        const g = 9.81; // Gravitational acceleration in m/s²
        const P_peak = (weight * g * (vertical_jump/100)) / 0.2;
        console.debug('Peak Power Output:', P_peak);
        const athleteStatsResult = await pool.query('SELECT * FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);

        if (athleteStatsResult.rows.length > 0) {
            await pool.query('UPDATE AthleteStats SET jumping_power = $1 WHERE athlete_id = $2', [P_peak, athlete_id]);
            return res.json({ athlete_id, jumping_power: P_peak, message: 'Jumping Power updated successfully' });
        } else {
            await pool.query('INSERT INTO AthleteStats (athlete_id, jumping_power) VALUES ($1, $2)', [athlete_id, P_peak]);
            return res.json({ athlete_id, jumping_power: P_peak, message: 'Jumping Power added successfully' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
