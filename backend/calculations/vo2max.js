import express from 'express';
import pool from '../db.js';
const router = express.Router();

router.put('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;

        const result = await pool.query('SELECT beep_test, dob FROM Athlete INNER JOIN BasicPerformance ON Athlete.athlete_id = BasicPerformance.athlete_id WHERE Athlete.athlete_id = $1', [athlete_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Athlete not found' });
        }

        const { beep_test, dob } = result.rows[0];
        
        const speed = (20 / beep_test) * 3.6;
        
        // Derive age from date of birth (dob)
        const dobDate = new Date(dob);
        const currentDate = new Date();
        let age = currentDate.getFullYear() - dobDate.getFullYear();
        const monthDifference = currentDate.getMonth() - dobDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < dobDate.getDate())) {
            age--;
        }
        console.debug('Age:', age);
        console.debug('Speed:', speed);
        
        if (!speed || !age) {
            return res.status(400).json({ error: 'Insufficient data to calculate VO2max' });
        }

        // Calculate VO2max
        const vo2max = 31.025 + (3.238 * speed) - (3.248 * age) + (0.1536 * speed * age);

        // Check if the athlete already has a record in AthleteStats
        const athleteStatsResult = await pool.query('SELECT * FROM AthleteStats WHERE athlete_id = $1', [athlete_id]);

        if (athleteStatsResult.rows.length > 0) {
            await pool.query('UPDATE AthleteStats SET vo2_max = $1 WHERE athlete_id = $2', [vo2max, athlete_id]);
            return res.json({ athlete_id, vo2max, message: 'VO2max updated successfully' });
        } else {
            await pool.query('INSERT INTO AthleteStats (athlete_id, vo2_max) VALUES ($1, $2)', [athlete_id, vo2max]);
            return res.json({ athlete_id, vo2max, message: 'VO2max added successfully' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
