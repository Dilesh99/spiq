import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/authentication.js';

const router = express.Router();

//Get all coaches
router.get('/',/*authenticateToken,*/ async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM coach');
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get specific coach
router.get('/:coach_nic', /*authenticateToken,*/ async (req, res) => {
    try {
        const { coach_id } = req.params;
        const result = await pool.query('SELECT username FROM coach WHERE id = $1', [coach_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'coach not found' });
        return res.json(result.rows[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

//Create an coach
router.post('/', async (req, res) => {
    try {
        const { nic, name, email, password, profile_pic } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO coach (nic, name, email, password, profile_pic) VALUES ($1, $2, $3, $4, $5)',
            [nic, name, email, hashedPassword, profile_pic]
        );
        return res.status(201).json({ message: 'coach created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Update coach
router.put('/', /*authenticateToken,*/ async (req, res) => {
    try {
        const { nic, name, email, passsword, profile_pic } = req.body;
        const hashedPassword = await bcrypt.hash(passsword, 10);
        await pool.query(
            'UPDATE coach SET name = $2, email = $3, password = $4, profile_pic = $5 WHERE nic = $1',
            [nic, name, email, hashedPassword, profile_pic]
        );
        res.json({ message: 'coach updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete coach
router.delete('/:coach_id', /*authenticateToken,*/ async (req, res) => {
    try {
        const { coach_id } = req.params;
        await pool.query('DELETE FROM coach WHERE coach_id = $1', [coach_id]);
        res.json({ message: 'coach deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;