import dotenv from 'dotenv';
import mongoose from 'mongoose';

class Database {
    private host: string;
    private port: string;
    private user: string;
    private password: string;
    private dbName: string;

    constructor() {
        dotenv.config();

        this.host = process.env.DB_HOST ?? '';
        this.port = process.env.DB_PORT ?? '';
        this.user = process.env.DB_USER ?? '';
        this.password = process.env.DB_PASSWORD ?? '';
        this.dbName = process.env.DB_NAME ?? '';
    }
    
    async getConnection() {
        try {
            return await mongoose.connect(`mongodb+srv://${this.user}:${this.password}@${this.host}/${this.dbName}?retryWrites=true&w=majority&appName=snake-xenzia`, { serverApi: { version: '1', strict: true, deprecationErrors: true } }).then(() => console.log('Connected to the database'));
        } catch (error) {
            console.error('Failed to connect to the database:', error);
            throw error;
        }
    }
}

export default Database;