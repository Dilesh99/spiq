import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwTokens } from '../utils/jwt-helper.js';

const router = express.Router();

router.post('/loginCoach', async (req, res) => {
    try {
        const { nic, password } = req.body;
        console.log(nic, password);
        const user = await pool.query('SELECT * FROM coach WHERE nic = $1', [nic]);

        if (user.rows.length === 0) {
            return res.json({ successful: false });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.json({ successful: false });
        }

        let tokens = jwTokens(user.rows[0].nic);

        const cookieOptions = {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 14*24*60*60*1000
        };

        return res.json({ successful: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.post('/refresh_token', (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.json(false);
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (error, user) => {
            if (error) return res.status(403).json({ error: error.message });

            const nic = user.nic;
            let accessToken = jwt.sign({ nic }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '15m' });

            res.json({accessToken, nic});
        });
    } catch (err) {
        console.error(err.message);
        return res.json(false);
    }
});

export default router;