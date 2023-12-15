"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRequestClient = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("./constants");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const weatherApiKey = process.env.WEATHER_API_KEY;
const weather_host = 'https://api.weatherapi.com/v1';
exports.apiRequestClient = {
    // текущая погода
    async currentWeather(city) {
        try {
            return await axios_1.default.get(`${weather_host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
        }
        catch (error) {
            return constants_1.API_RESULT.UNKNOWN_ERROR;
        }
    },
    // запрос погоды по дате
    async forecastDate(city, date) {
        try {
            return await axios_1.default.get(`${weather_host}/forecast.json?key=${weatherApiKey}&q=${city}&lang=ru&date=${date}`);
        }
        catch (error) {
            return constants_1.API_RESULT.UNKNOWN_ERROR;
        }
    },
    // запрос погоды на определенное количество дней
    async forecastDays(city, days) {
        try {
            return await axios_1.default.get(`${weather_host}/forecast.json?key=${weatherApiKey}&q=${city}&lang=ru&days=${days}`);
        }
        catch (error) {
            return constants_1.API_RESULT.UNKNOWN_ERROR;
        }
    },
    // тестовый запрос текущей погоды. Выполняется чтобы определить существующий ли город ввел пользователью
    async checkCity(city) {
        try {
            const response = await axios_1.default.get(`${weather_host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
            return response.data.location.name;
        }
        catch (error) {
            return constants_1.API_RESULT.UNKNOWN_ERROR;
        }
    }
};
