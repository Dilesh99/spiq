import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.put('/:athlete_id', async (req, res) => {
  try {
    const { athlete_id } = req.params;

    // 1. Fetch sit_and_reach and height
    const result = await pool.query(
      `SELECT BasicPerformance.sit_and_reach, measurements.height 
       FROM measurements inner join BasicPerformance
       ON measurements.athlete_id = BasicPerformance.athlete_id
       WHERE measurements.athlete_id = $1`,
      [athlete_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const { sit_and_reach, height } = result.rows[0];

    if (sit_and_reach == null || height == null) {
      return res.status(400).json({ error: 'Insufficient data to calculate Flexibility Index' });
    }

    // 2. Calculate Flexibility Index
    const flexibility_index = (sit_and_reach / height) * 100;

    // 3. Check if athlete already exists in AthleteStats
    const check = await pool.query(
      'SELECT 1 FROM AthleteStats WHERE athlete_id = $1',
      [athlete_id]
    );

    if (check.rows.length > 0) {
      await pool.query(
        `UPDATE AthleteStats 
         SET flexibility_index = $1 
         WHERE athlete_id = $2`,
        [flexibility_index, athlete_id]
      );
      return res.json({ athlete_id, flexibility_index, message: 'Flexibility Index updated successfully' });
    } else {
      await pool.query(
        `INSERT INTO AthleteStats (athlete_id, flexibility_index) 
         VALUES ($1, $2)`,
        [athlete_id, flexibility_index]
      );
      return res.json({ athlete_id, flexibility_index, message: 'Flexibility Index added successfully' });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
