import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.put('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT time_100m , height FROM measurements INNER JOIN BasicPerformance ON measurements.athlete_id = BasicPerformance.athlete_id WHERE measurements.athlete_id = $1', [athlete_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlete not found' });
        }

        const { time_100m, height } = result.rows[0];
        if (time_100m == null || height == null) {
            return res.status(400).json({ error: 'Insufficient data to calculate SpeedIndex' });
        }        

        const speedIndex = (time_100m / (height/100));

        // Check if the athlete already has a record in AthleteStats
        const athleteStatsResult = await pool.query('SELECT * FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);

        if (athleteStatsResult.rows.length > 0) {
            await pool.query('UPDATE AthleteStats SET speed_index = $1 WHERE athlete_id = $2', [speedIndex, athlete_id]);
            return res.json({ athlete_id, speedIndex, message: 'SpeedIndex updated successfully' });
        } else {
            await pool.query('INSERT INTO AthleteStats (athlete_id, speed_index) VALUES ($1, $2)', [athlete_id, speedIndex]);
            return res.json({ athlete_id, speedIndex, message: 'SpeedIndex added successfully' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
