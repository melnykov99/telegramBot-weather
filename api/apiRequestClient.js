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
const weatherHost = "https://api.weatherapi.com/v1";
//Methods for requesting weather via app.weatherapi.com
exports.apiRequestClient = {
    //Request forecast by date in format yyyy-mm-dd
    async forecastDate(city, date) {
        try {
            return await axios_1.default.get(`${weatherHost}/forecast.json?key=${weatherApiKey}&q=${city}&lang=ru&date=${date}`);
        }
        catch (error) {
            return constants_1.API_RESULT.UNKNOWN_ERROR;
        }
    },
    //Request weather for several days. Free API plan is limited, maximum 3 days
    async forecastDays(city, days) {
        try {
            return await axios_1.default.get(`${weatherHost}/forecast.json?key=${weatherApiKey}&q=${city}&lang=ru&days=${days}`);
        }
        catch (error) {
            return constants_1.API_RESULT.UNKNOWN_ERROR;
        }
    },
    //Test request which use for validation city. If city exists return city name, else return error
    async checkCity(city) {
        try {
            const response = await axios_1.default.get(`${weatherHost}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
            return response.data.location.name;
        }
        catch (error) {
            return constants_1.API_RESULT.UNKNOWN_ERROR;
        }
    }
};
