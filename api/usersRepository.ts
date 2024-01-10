import {Pool} from "pg";
import dotenv from "dotenv";
import {DB_RESULT} from "./constants";

dotenv.config();

//Database connection information
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
});

//Methods for works with DB
export const usersRepository = {
    async foundCityByUserChatId(chatId: number) {
        try {
            const data = await pool.query('SELECT city FROM main WHERE "chatId" = $1', [chatId]);
            if (data.rowCount === 0) {
                return DB_RESULT.NOT_FOUND;
            }
            return data.rows[0].city;
        } catch (error) {
            console.log(error);
            return DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async addUser(chatId: number, city: string, fullCity: string) {
        try {
            await pool.query('INSERT INTO main ("chatId", city, "fullCity") VALUES ($1, $2, $3)', [chatId, city, fullCity]);
            return DB_RESULT.SUCCESSFULLY;
        } catch (error) {
            console.log(error);
            return DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async updateCityByChatId(chatId: number, newCity: string, newFullCity: string) {
        try {
            await pool.query('UPDATE main SET city = $2, "fullCity" = $3 WHERE "chatId" = $1', [chatId, newCity, newFullCity])
            return DB_RESULT.SUCCESSFULLY;
        } catch (error) {
            console.log(error);
            return DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async getAllUsers() {
        try {
            return await pool.query('SELECT * FROM main');
        } catch (error) {
            console.log(error);
            return DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async updateNotifications(type: boolean, chatId: number) {
        try {
            await pool.query('UPDATE main SET "sendNotification" = $1 WHERE "chatId" = $2', [type, chatId])
            return DB_RESULT.SUCCESSFULLY;
        } catch (error) {
            console.log(error);
            return DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async addError(error: any, chatId: number) {
        try {
            await pool.query('UPDATE main SET "lastError" = $1 WHERE "chatId" = $2', [error, chatId])
            return DB_RESULT.SUCCESSFULLY;
        } catch (error) {
            console.log(error);
            return DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async foundUserByChatId(chatId: number) {
        try {
            const foundUser = await pool.query('SELECT * FROM main WHERE "chatId" = $1', [chatId])
            if (foundUser.rowCount === 0) {
                return DB_RESULT.NOT_FOUND
            }
            return foundUser
        } catch (error) {
            console.log(error);
            return DB_RESULT.UNKNOWN_ERROR;
        }
    }
}