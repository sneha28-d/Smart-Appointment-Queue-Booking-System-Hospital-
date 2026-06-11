const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const ConnectDB = async (): Promise<void> => {
    try {
        if ((process.env.MONGO_URI as string)?.includes('<db_password>')) {
            console.error('❌ CRITICAL ERROR: Please replace <db_password> in your .env file');
        }
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Database is connected');
    } catch (error: any) {
        console.error(`DB Error: ${error.message}`);
        console.error('Server is still listening, but DB operations will fail.');
    }
};

module.exports = { ConnectDB };
