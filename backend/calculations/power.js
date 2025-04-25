import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.put('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        
        // Query to fetch athlete's mass (body weight) and time_100m score from the Athlete and BasicPerformance tables
        const result = await pool.query('SELECT weight, time_100m FROM measurements INNER JOIN BasicPerformance ON measurements.athlete_id = BasicPerformance.athlete_id WHERE measurements.athlete_id = $1', [athlete_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlete not found' });
        }

        const { weight, time_100m } = result.rows[0];
        console.debug('Weight:', weight);
        console.debug('Beep Test:', time_100m);

        if (weight == null || time_100m == null) {
            return res.status(400).json({ error: 'Insufficient data to calculate Power Output' });
        }

        const speed = 100 / time_100m;

        // Calculate Power Output using the formula: P = Mass * g * Speed
        const powerOutput = weight * 9.81 * speed;

        // Check if the athlete already has a record in AthleteStats
        const athleteStatsResult = await pool.query('SELECT * FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);

        if (athleteStatsResult.rows.length > 0) {
            await pool.query('UPDATE AthleteStats SET power_output = $1 WHERE athlete_id = $2', [powerOutput, athlete_id]);
            return res.json({ athlete_id, powerOutput, message: 'Power Output updated successfully' });
        } else {
            await pool.query('INSERT INTO AthleteStats (athlete_id, power_output) VALUES ($1, $2)', [athlete_id, powerOutput]);
            return res.json({ athlete_id, powerOutput, message: 'Power Output added successfully' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
