"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    foundUserByChatId(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield pool.query('SELECT * FROM main WHERE "chatId" = $1', [chatId]);
                if (data.rowCount === 0) {
                    return constants_1.DB_RESULT.NOT_FOUND;
                }
                return data.rows;
            }
            catch (error) {
                console.log(error);
                return constants_1.DB_RESULT.UNKNOWN_ERROR;
            }
        });
    },
    foundCityByUserChatId(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield pool.query('SELECT city FROM main WHERE "chatId" = $1', [chatId]);
                if (data.rowCount === 0) {
                    return constants_1.DB_RESULT.NOT_FOUND;
                }
                return data.rows[0].city;
            }
            catch (error) {
                console.log(error);
                return constants_1.DB_RESULT.UNKNOWN_ERROR;
            }
        });
    },
    addUser(chatId, city) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield pool.query('INSERT INTO main ("chatId", city) VALUES ($1, $2)', [chatId, city]);
                return constants_1.DB_RESULT.SUCCESSFULLY;
            }
            catch (error) {
                console.log(error);
                return constants_1.DB_RESULT.UNKNOWN_ERROR;
            }
        });
    }
};
