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
exports.checkCity = exports.currentWeather = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const weatherApiKey = process.env.WEATHER_API_KEY;
const weather_host = 'https://api.weatherapi.com/v1';
function currentWeather(city) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${weather_host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
            const temperatureText = (0, utils_1.handlerTemperature)(response.data.current.temp_c);
            const conditionText = (0, utils_1.handlerConditionCode)(response.data.current.condition.code, response.data.current.condition.text);
            const windText = `Скорость ветра: ${response.data.current.wind_mph} м/с💨`;
            const fullAnswer = `Погода в городе <b>${response.data.location.name}</b> 🌇\n${temperatureText} \n${conditionText} \n${windText}`;
            return fullAnswer;
        }
        catch (error) {
            return constants_1.API_RESULT.INCORRECT_CITY;
        }
    });
}
exports.currentWeather = currentWeather;
function checkCity(city) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${weather_host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
            return response.data.location.name;
        }
        catch (error) {
            return constants_1.API_RESULT.INCORRECT_CITY;
        }
    });
}
exports.checkCity = checkCity;
