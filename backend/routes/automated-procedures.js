import cron from 'node-cron';
import pool from '../db.js';

export const scheduledJobs = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            await pool.query('CALL reset_update_counts()');
        }
        catch (error) {
            console.log("Resetting count failed : ", error);
        }
    }, {
        scheduled: true,
        timezone: 'Asia/Colombo'
    });
}
