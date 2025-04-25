import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

//Get all measurementses
router.get('/',/*authenticateToken,*/ async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM measurements');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get specific measurement
router.get('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT * FROM measurements WHERE athlete_id = $1', [athlete_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'measurements not found' });
        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

//Create an measurements
router.post('/', async (req, res) => {
    try {
        const { athlete_id, height, weight, uac, cc, skinfold_triceps, skinfold_subscapular, skinfold_supraspinale, skinfold_medial_calf, humerous_width, femur_width } = req.body;
        await pool.query(
            'INSERT INTO measurements (athlete_id, height, weight, uac, cc, skinfold_triceps, skinfold_subscapular, skinfold_supraspinale, skinfold_medial_calf, humerous_width, femur_width) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            [athlete_id, height, weight, uac, cc, skinfold_triceps, skinfold_subscapular, skinfold_supraspinale, skinfold_medial_calf, humerous_width, femur_width]
        );
        return res.status(201).json({ message: 'measurements created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update measurements
router.put('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id, height, weight, uac, cc, skinfold_triceps, skinfold_subscapular, skinfold_supraspinale, skinfold_medial_calf, humerous_width, femur_width } = req.body;
        await pool.query(
            'UPDATE measurements SET height = $2, weight = $3, uac = $4, cc = $5, skinfold_triceps = $6, skinfold_subscapular = $7, skinfold_supraspinale = $8, skinfold_medial_calf = $9, humerous_width = $10, femur_width = $11 WHERE athlete_id = $1',
            [athlete_id, height, weight, uac, cc, skinfold_triceps, skinfold_subscapular, skinfold_supraspinale, skinfold_medial_calf, humerous_width, femur_width]
        );
        res.json({ message: 'measurements updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete measurements
router.delete('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        await pool.query('DELETE FROM measurements WHERE measurements_id = $1', [athlete-id]);
        res.json({ message: 'measurement deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;