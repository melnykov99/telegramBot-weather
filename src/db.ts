import {Pool} from "pg";
import dotenv from 'dotenv';
import {DB_RESULT} from "./constants";

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
});

//TODO: any убрать
export async function foundUserByChatId(chatId: number): Promise<DB_RESULT.NOT_FOUND | DB_RESULT.UNKNOWN_ERROR | any[]> {
    try {
        const data = await pool.query('SELECT * FROM main WHERE "chatId" = $1', [chatId])
        if (data.rowCount === 0) {
            return DB_RESULT.NOT_FOUND
        }
        return data.rows
    } catch (error) {
        console.log(error)
        return DB_RESULT.UNKNOWN_ERROR
    }
}
export async function addUserInDB(chatId: number, city: string): Promise<DB_RESULT.SUCCESSFULLY | DB_RESULT.UNKNOWN_ERROR>{
    try {
        await pool.query('INSERT INTO main ("chatId", city) VALUES ($1, $2)', [chatId, city])
        return DB_RESULT.SUCCESSFULLY
    } catch (error) {
        console.log(error)
        return DB_RESULT.UNKNOWN_ERROR
    }
}