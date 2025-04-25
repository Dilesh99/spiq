// routes/somatotype.js
import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/athlete/:athlete_id/somatotype
router.put('/:athlete_id', /* authenticateToken, */ async (req, res) => {
  try {
    const { athlete_id } = req.params;
    if (!athlete_id) {
      return res.status(400).json({ error: 'Missing athlete_id' });
    }

    // 1) Fetch all required raw measures
    const { rows } = await pool.query(
      `SELECT
         height,              -- cm
         weight,              -- kg
         uac,                 -- cm
         cc,                  -- cm
         skinfold_triceps,    -- mm
         skinfold_subscapular,-- mm
         skinfold_supraspinale,-- mm
         skinfold_medial_calf,-- mm
         humerus_width,       -- cm
         femur_width          -- cm
       FROM measurements
       WHERE athlete_id = $1`,
      [athlete_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Athlete measurements not found' });
    }
    const m = rows[0];

    // 2) Validate none are null
    const needed = [
      'height','weight','uac','cc',
      'skinfold_triceps','skinfold_subscapular',
      'skinfold_supraspinale','skinfold_medial_calf',
      'humerus_width','femur_width'
    ];
    if (needed.some(k => m[k] == null)) {
      return res.status(400).json({ error: 'Insufficient data for somatotype calculation' });
    }

    const height  = parseFloat(m.height);
    const skfTri  = parseFloat(m.skinfold_triceps);
    const skfSub  = parseFloat(m.skinfold_subscapular);
    const skfSup  = parseFloat(m.skinfold_supraspinale);

    if (
        isNaN(height)  || height  <= 0 ||
        isNaN(skfTri)  || skfTri  < 0 ||
        isNaN(skfSub)  || skfSub  < 0 ||
        isNaN(skfSup)  || skfSup  < 0
      ) {
        return res
          .status(400)
          .json({ error: 'Invalid inputs for endomorphy calculation' });
      }


    // 3) Endomorphy
    const S = skfTri + skfSub + skfSup;          // sum of skinfolds in mm
    const X = (S * 170.18) / height;             // dimensionless

    let endo =
    -0.7182
    + 0.1451  * X
    - 0.00068 * (X * X)
    + 0.0000014 * (X * X * X);
    if (endo < 0.1) endo = 0.1;

    console.debug('S (mm):', S);
    console.debug('X:', X);
    console.debug('Endomorphy:', endo);

    // 4) Mesomorphy
    const corrArm  = m.uac - (m.skinfold_triceps / 10);
    const corrCalf = m.cc  - (m.skinfold_medial_calf / 10);
    const meso =
      0.858 * m.humerus_width +
      0.601 * m.femur_width +
      0.188 * corrArm +
      0.161 * corrCalf -
      0.131 * m.height +
      4.5;

    // 5) Ectomorphy
    const HWR = m.height / Math.cbrt(m.weight);
    let ecto;
    if (HWR > 40.75) {
      ecto = 0.732 * HWR - 28.58;
    } else if (HWR >= 38.25) {
      ecto = 0.463 * HWR - 17.63;
    } else {
      ecto = 0.1;
    }

    // 6) Determine dominant
    const scores = { endomorphy: endo, mesomorphy: meso, ectomorphy: ecto };
    const dominant = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)[0][0];

    // 7) Upsert into Somatotype table
    const exists = await pool.query(
      'SELECT 1 FROM Somatotype WHERE athlete_id = $1',
      [athlete_id]
    );

    if (exists.rows.length) {
      await pool.query(
        `UPDATE Somatotype
            SET endomorphy = $1,
                mesomorphy = $2,
                ectomorphy = $3
          WHERE athlete_id = $4`,
        [endo, meso, ecto, athlete_id]
      );
      return res.json({
        athlete_id, endomorphy: endo, mesomorphy: meso, ectomorphy: ecto,
        dominant, message: 'Somatotype updated successfully'
      });
    } else {
      await pool.query(
        `INSERT INTO Somatotype
           (athlete_id, endomorphy, mesomorphy, ectomorphy)
         VALUES ($1, $2, $3, $4)`,
        [athlete_id, endo, meso, ecto]
      );
      return res.json({
        athlete_id, endomorphy: endo, mesomorphy: meso, ectomorphy: ecto,
        dominant, message: 'Somatotype added successfully'
      });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
