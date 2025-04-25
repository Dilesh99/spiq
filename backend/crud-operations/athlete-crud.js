import express from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

//Get all athletes
router.get('/', /*authenticateToken,*/ async (req, res) => {
    try {
        console.debug('Getting all athletes');
        const result = await pool.query('SELECT * FROM athlete');
        const athletes = result.rows.map((athlete) => {
            if (athlete.dob instanceof Date) {
                const localDate = new Date(athlete.dob.getTime() - athlete.dob.getTimezoneOffset() * 60000);
                athlete.dob = localDate.toISOString().split('T')[0];
            }
            return athlete;
        });
        return res.json(athletes);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


// Get specific athlete
router.get('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        const result = await pool.query('SELECT * FROM athlete WHERE athlete_id = $1', [athlete_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'athlete not found' });
        const athlete = result.rows[0];
        if (athlete.dob instanceof Date) {
            const localDate = new Date(athlete.dob.getTime() - athlete.dob.getTimezoneOffset() * 60000);
            athlete.dob = localDate.toISOString().split('T')[0];
        }
        return res.json(athlete);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

//Create an athlete
router.post('/', async (req, res) => {
    try {
        console.debug('Creating athlete');
        console.debug(req.body);
        const { coach_nic, name, dob, sex, profile_pic } = req.body;
        const formattedDOB = new Date(dob);
        await pool.query(
            'INSERT INTO athlete (coach_nic, name, dob, sex, profile_pic) VALUES ($1, $2, $3, $4, $5)',
            [coach_nic, name, formattedDOB, sex, profile_pic]
        );
        return res.status(201).json({ message: 'athlete created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update athlete
router.put('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id, coach_nic, name, dob, sex, profile_pic } = req.body;
        await pool.query(
            'UPDATE athlete SET coach_nic = $2, name = $3, dob = $4, sex = $5, profile_pic = $6 WHERE athlete_id = $1',
            [athlete_id, coach_nic, name, dob, sex, profile_pic]
        );
        res.json({ message: 'athlete updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete athlete
router.delete('/:athlete_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { athlete_id } = req.params;
        await pool.query('DELETE FROM athlete WHERE athlete_id = $1', [athlete_id]);
        res.json({ message: 'athlete deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;