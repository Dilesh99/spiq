import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.put('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    console.debug('BMI calculation endpoint hit');
    try {
        const { athlete_id } = req.params;
        console.debug(athlete_id);
        const result = await pool.query('SELECT weight, height FROM measurements WHERE athlete_id = $1', [athlete_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlete not found' });
        }

        const { weight, height } = result.rows[0];

        if (!weight || !height) {
            return res.status(400).json({ error: 'Insufficient data to calculate BMI' });
        }

        // BMI
        const heightInMeters = height / 100; 
        const bmi = weight / (heightInMeters ** 2);

        // Check if the athlete already has a record in AthleteStats
        const athleteStatsResult = await pool.query('SELECT * FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);

        if (athleteStatsResult.rows.length > 0) {
            await pool.query('UPDATE AthleteStats SET bmi = $1 WHERE athlete_id = $2', [bmi, athlete_id]);
            return res.json({ message: 'BMI updated successfully' });
        } else {
            await pool.query('INSERT INTO AthleteStats (athlete_id, bmi) VALUES ($1, $2)', [athlete_id, bmi]);
            return res.json({ message: 'BMI added successfully' });
        }

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
