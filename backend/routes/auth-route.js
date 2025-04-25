import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwTokens } from '../utils/jwt-helper.js';

const router = express.Router();

router.post('/loginUser', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.json({ successful: false });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.json({ successful: false });
        }

        let tokens = jwTokens(user.rows[0].username);

        const cookieOptions = {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        };

        if (rememberMe) {
            cookieOptions.maxAge = 14 * 24 * 60 * 60 * 1000;
        }

        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
        return res.json({ successful: true, accessToken: tokens.accessToken });

    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/loginAdmin', async (req, res) => {
    try {
        const { username, password, rememberMe } = req.body;
        console.log(rememberMe);
        const user = await pool.query('SELECT * FROM admin WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.json({ successful: false });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.json({ successful: false });
        }

        let tokens = jwTokens(user.rows[0].username);

        const cookieOptions = {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        };

        if (rememberMe) {
            cookieOptions.maxAge = 14 * 24 * 60 * 60 * 1000;
        }

        res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
        return res.json({ successful: true, accessToken: tokens.accessToken });

    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.get('/refresh_token', (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.json(false);
        }
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (error, user) => {
            if (error) return res.status(403).json({ error: error.message });

            const {username } = user;
            let accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '15m' });

            res.json({accessToken, username});
        });
    } catch (err) {
        console.error(err.message);
        return res.json(false);
    }
});


/* Logout function from the frontend calls here */
router.delete('/delete_token', (req, res) => {
    try {
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Refresh token deleted' });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

export default router;