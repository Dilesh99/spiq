import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/athlete/:athlete_id/nme
router.put('/:athlete_id', /* authenticateToken, */ async (req, res) => {
  try {
    const { athlete_id } = req.params;

    // 1) fetch all the raw measures we need
    const result = await pool.query(
      `SELECT 
         m.uac,
         m.cc,
         m.skinfold_triceps,
         m.skinfold_medial_calf,
         bp.vertical_jump,
         bp.grip_strength,
         bp.time_30m,
         m.weight
       FROM measurements m
       LEFT JOIN BasicPerformance bp
         ON m.athlete_id = bp.athlete_id
       WHERE m.athlete_id = $1`,
      [athlete_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    const {
      uac,
      cc,
      skinfold_triceps,
      skinfold_medial_calf,
      vertical_jump,
      grip_strength,
      time_30m,
      weight
    } = result.rows[0];

    // 2) validate
    if (
      [uac, cc, skinfold_triceps, skinfold_medial_calf,
       vertical_jump, grip_strength, time_30m, weight]
      .some(v => v == null)
    ) {
      return res
        .status(400)
        .json({ error: 'Insufficient data to calculate NME' });
    }

    // 3) compute CSAs (skinfolds are in mm; convert to cm by /10)
    const armCSA = Math.pow(
      uac - Math.PI * (skinfold_triceps / 10),
      2
    ) / (4 * Math.PI);

    const calfCSA = Math.pow(
      cc - Math.PI * (skinfold_medial_calf / 10),
      2
    ) / (4 * Math.PI);

    // 4) explosive outputs
    // Sayer's vertical jump power (W)
    const jumpPower = 60.7 * vertical_jump + 45.3 * weight - 2055;

    // sprint speed over 30m (m/s)
    const speed30 = 30.0 / time_30m;

    // 5) local NME indices
    const nme_leg    = jumpPower  / calfCSA;   // W per cm²
    const nme_arm    = grip_strength / armCSA; // kg per cm²
    const nme_sprint = speed30   / calfCSA;   // m/s per cm²

    // 6) simple composite (average)
    const neuromuscular_efficiency = (nme_leg + nme_arm + nme_sprint) / 3;

    // 7) upsert into AthleteStats
    const { rows: statsRows } = await pool.query(
      'SELECT 1 FROM AthleteStats WHERE athlete_id = $1',
      [athlete_id]
    );

    if (statsRows.length > 0) {
      await pool.query(
        `UPDATE AthleteStats
         SET nme_leg    = $1,
             nme_arm    = $2,
             nme_sprint = $3,
             neuromuscular_efficiency= $4
         WHERE athlete_id = $5`,
        [nme_leg, nme_arm, nme_sprint, neuromuscular_efficiency, athlete_id]
      );
      return res.json({
        athlete_id,
        nme_leg,
        nme_arm,
        nme_sprint,
        neuromuscular_efficiency,
        message: 'NME updated successfully'
      });
    } else {
      await pool.query(
        `INSERT INTO AthleteStats
         (athlete_id, nme_leg, nme_arm, nme_sprint, neuromuscular_efficiency)
         VALUES ($1, $2, $3, $4, $5)`,
        [athlete_id, nme_leg, nme_arm, nme_sprint, neuromuscular_efficiency]
      );
      return res.json({
        athlete_id,
        nme_leg,
        nme_arm,
        nme_sprint,
        neuromuscular_efficiency,
        message: 'NME added successfully'
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
