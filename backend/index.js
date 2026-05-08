import express from 'express';
import cors from 'cors';
import { supabase } from './database.js';

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to InternLink API' });
});

app.get('/health', async (req, res) => {
    try {
        // Just checking if supabase client is initialized
        if (supabase) {
            res.json({ status: 'healthy', database: 'supabase-connected' });
        } else {
            res.status(500).json({ status: 'unhealthy', error: 'Database client not initialized' });
        }
    } catch (error) {
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
