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
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherService = void 0;
const apiRequestClient_1 = require("./apiRequestClient");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const db_1 = require("./db");
exports.weatherService = {
    forecastTogether(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const city = yield db_1.usersRepository.foundCityByUserChatId(chatId);
            if (city === constants_1.DB_RESULT.NOT_FOUND) {
                return 'Ошибка при запросе погоды! Попробуйте нажать кнопку "Изменить город".';
            }
            if (city === constants_1.DB_RESULT.UNKNOWN_ERROR) {
                return 'Ошибка при запросе погоды! Попробуйте позже.';
            }
            const togetherDate = new Date().toISOString().split('T')[0];
            const togetherDateRuFormat = (0, utils_1.changeDateRuFormat)(togetherDate);
            const response = yield apiRequestClient_1.apiRequestClient.forecastDate(city, togetherDate);
            if (response === constants_1.API_RESULT.UNKNOWN_ERROR) {
                return 'Ошибка при запросе погоды! Попробуйте позже.';
            }
            const maxTemp = response.data.forecast.forecastday[0].day.maxtemp_c;
            const minTemp = response.data.forecast.forecastday[0].day.mintemp_c;
            const avgWind = response.data.forecast.forecastday[0].day.avgvis_km;
            const rainChance = response.data.forecast.forecastday[0].day.daily_chance_of_rain;
            const snowChance = response.data.forecast.forecastday[0].day.daily_chance_of_snow;
            const conditionIcon = (0, utils_1.handlerConditionCode)(response.data.forecast.forecastday[0].day.condition.code);
            const avgCondition = `${response.data.forecast.forecastday[0].day.condition.text.toLowerCase()} ${conditionIcon}`;
            return `Погода <b>${togetherDateRuFormat}</b> в городе <b>${city}</b> 🌇\nБольшую часть дня будет <b>${avgCondition}</b>\nТемпература: от <b>${minTemp}℃</b> ⬇️ до <b>${maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${avgWind} м/с</b> 🌬\nВероятность дождя: <b>${rainChance}%</b> 🌧\nВероятность снега: <b>${snowChance}%</b> ❄️`;
        });
    },
    forecastTomorrow() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    },
    forecastThreeDays() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    },
    forecastSevenDays() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
};
