import express from 'express';
import pool from '../db.js';

const router = express.Router();

router.put('/:athlete_id', async (req, res) => {
  try {
    const { athlete_id } = req.params;

    // 1. Fetch required data
    const result = await pool.query(
        "SELECT BasicPerformance.vertical_jump, measurements.weight, AthleteStats.vo2_max FROM measurements INNER JOIN AthleteStats ON measurements.athlete_id = AthleteStats.athlete_id INNER JOIN BasicPerformance ON measurements.athlete_id = BasicPerformance.athlete_id WHERE measurements.athlete_id = $1",
        [athlete_id]
      );
      

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Athlete not found or missing performance data' });
    }

    const { vertical_jump, weight, vo2_max } = result.rows[0];

    if (vertical_jump == null || weight == null || vo2_max == null) {
      return res.status(400).json({ error: 'Insufficient data to calculate Sprint Fatigue Index' });
    }

    // 2. Calculate Jumping Power (Watts)
    // Formula: Power = 60.7 × jump(cm) + 45.3 × weight(kg) − 2055
    const jumping_power = (60.7 * vertical_jump) + (45.3 * weight) - 2055;

    // 3. Sprint Fatigue Index estimate
    const sprint_fatigue_index = (jumping_power / vo2_max) * 10;

    // 4. Update or insert into AthleteStats
    const check = await pool.query(
      'SELECT 1 FROM AthleteStats WHERE athlete_id = $1',
      [athlete_id]
    );

    if (check.rows.length > 0) {
      await pool.query(
        `UPDATE AthleteStats 
         SET sprint_fatigue_index = $1
         WHERE athlete_id = $2`,
        [sprint_fatigue_index, athlete_id]
      );
      return res.json({ athlete_id, sprint_fatigue_index, message: 'Sprint Fatigue Index updated successfully' });
    } else {
      await pool.query(
        `INSERT INTO AthleteStats (athlete_id, sprint_fatigue_index)
         VALUES ($1, $2)`,
        [athlete_id, sprint_fatigue_index]
      );
      return res.json({ athlete_id, sprint_fatigue_index, message: 'Sprint Fatigue Index added successfully' });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
