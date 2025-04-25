import express, {json} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {dirname, join} from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth-route.js';
import athleteCRUDRouter from './crud-operations/athlete-crud.js';
import coachcRUDRouter from './crud-operations/coach-crud.js';
import measurementscRUDRouter from './crud-operations/measurements-crud.js';
import athleteStatCRUDRouter from './crud-operations/athlete-stat-crud.js';
import basicPerformanceCRUDRouter from './crud-operations/basic-performance-crud.js';
import modelRouter from './crud-operations/model-crud.js';

import dash100Router from './sports/100m.js';
import dash200Router from './sports/200m.js';
import dash400Router from './sports/400m.js';
import hurdlesRouter from './sports/hurdles.js';
import verticalRouter from './sports/vertical-jump.js';
import longRouter from './sports/long-jump.js';
import trippleRouter from './sports/tripple-jump.js';

import bmiRouter from './calculations/bmi.js';
import ptwRouter from './calculations/ptw.js';
import vo2maxRouter from './calculations/vo2max.js';
import speedRouter from './calculations/speed.js';
import powerRouter from './calculations/power.js';
import jumpingpowerRouter from './calculations/jumping.js';
import gripRouter from './calculations/grip.js';
import nmeRouter from './calculations/neuromuscular-index.js'
import flexibilityRouter from './calculations/flexibility.js';
import sfiRouter from './calculations/sfi.js';
import somatoRouter from './calculations/somatotypes.js';

import { scheduledJobs } from './routes/automated-procedures.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;
const origin = process.env.origin || 'http://localhost:8081';

const corsOptions = {origin: "*"};

app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());
app.use('/',express.static(join(__dirname, 'public')));

app.use('/auth', authRouter);

app.use('/athlete-crud',athleteCRUDRouter);
app.use('/coach-crud',coachcRUDRouter);
app.use('/measurements-crud',measurementscRUDRouter);
app.use('/athlete-stat-crud',athleteStatCRUDRouter);
app.use('/basic-performance-crud',basicPerformanceCRUDRouter);
app.use('/model-crud', modelRouter);

app.use('/100m-crud', dash100Router);
app.use('/200m-crud',dash200Router);
app.use('/400m-crud',dash400Router);
app.use('/hurdles-crud',hurdlesRouter);
app.use('/vertical-crud',verticalRouter);
app.use('/long-crud',longRouter);
app.use('/tripple-crud',trippleRouter);

app.use('/bmi', bmiRouter);
app.use('/ptw', ptwRouter);
app.use('/vo2max', vo2maxRouter);
app.use('/speed', speedRouter);
app.use('/power', powerRouter);
app.use('/jumpingpower', jumpingpowerRouter);
app.use('/grip', gripRouter);
app.use('/nme', nmeRouter);
app.use('/flexibility', flexibilityRouter);
app.use('/sfi', sfiRouter);
app.use('/somato', somatoRouter);


scheduledJobs();

app.listen(PORT, ()=>console.log(`Server listening on ${PORT}`));