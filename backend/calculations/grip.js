import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.put('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        
        // Query to fetch athlete's maximal grip strength and body mass (weight)
        const result = await pool.query('SELECT grip_strength, weight FROM measurements INNER JOIN BasicPerformance ON measurements.athlete_id = BasicPerformance.athlete_id WHERE measurements.athlete_id = $1', [athlete_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlete not found' });
        }

        const { grip_strength, weight } = result.rows[0];
        console.debug('Grip Strength:', grip_strength);
        console.debug('Body Mass:', weight);

        // Check if grip strength and body mass are available
        if (grip_strength == null || weight == null) {
            return res.status(400).json({ error: 'Insufficient data to calculate Grip Index' });
        }

        // Calculate Grip Index using the formula: Grip Strength = Maximal Force (N) / Body Mass (kg)
        const gripIndex = grip_strength / weight;

        // Check if the athlete already has a record in AthleteStats
        const athleteStatsResult = await pool.query('SELECT * FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);

        if (athleteStatsResult.rows.length > 0) {
            // If athlete exists, update the Grip Index
            await pool.query('UPDATE AthleteStats SET grip_index = $1 WHERE athlete_id = $2', [gripIndex, athlete_id]);
            return res.json({ athlete_id, gripIndex, message: 'Grip Index updated successfully' });
        } else {
            // If athlete does not exist, insert a new record
            await pool.query('INSERT INTO AthleteStats (athlete_id, grip_index) VALUES ($1, $2)', [athlete_id, gripIndex]);
            return res.json({ athlete_id, gripIndex, message: 'Grip Index added successfully' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
