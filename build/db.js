"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRepository = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const constants_1 = require("./constants");
dotenv_1.default.config();
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
});
exports.usersRepository = {
    async foundUserByChatId(chatId) {
        try {
            const data = await pool.query('SELECT * FROM main WHERE "chatId" = $1', [chatId]);
            if (data.rowCount === 0) {
                return constants_1.DB_RESULT.NOT_FOUND;
            }
            return data.rows;
        }
        catch (error) {
            console.log(error);
            return constants_1.DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async foundCityByUserChatId(chatId) {
        try {
            const data = await pool.query('SELECT city FROM main WHERE "chatId" = $1', [chatId]);
            if (data.rowCount === 0) {
                return constants_1.DB_RESULT.NOT_FOUND;
            }
            return data.rows[0].city;
        }
        catch (error) {
            console.log(error);
            return constants_1.DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async addUser(chatId, city) {
        try {
            await pool.query('INSERT INTO main ("chatId", city) VALUES ($1, $2)', [chatId, city]);
            return constants_1.DB_RESULT.SUCCESSFULLY;
        }
        catch (error) {
            console.log(error);
            return constants_1.DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async updateCityByChatId(chatId, newCity) {
        try {
            await pool.query('UPDATE main SET city = $1 WHERE "chatId" = $2', [newCity, chatId]);
            return constants_1.DB_RESULT.SUCCESSFULLY;
        }
        catch (error) {
            console.log(error);
            return constants_1.DB_RESULT.UNKNOWN_ERROR;
        }
    },
    async getAllUsers() {
        try {
            return await pool.query('SELECT "chatId" FROM main');
        }
        catch (error) {
            console.log(error);
            return constants_1.DB_RESULT.UNKNOWN_ERROR;
        }
    }
};
