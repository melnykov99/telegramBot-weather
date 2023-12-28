"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherService = void 0;
const apiRequestClient_1 = require("./apiRequestClient");
const utils_1 = require("./utils");
const constants_1 = require("./constants");
const usersRepository_1 = require("./usersRepository");
//Main logic app. Requests to the weather API and generation of a message for the user
exports.weatherService = {
    //Checking the city name from the database. If the name is not found or an error occurs, return the corresponding text
    handlerCityError(city) {
        switch (city) {
            case constants_1.DB_RESULT.NOT_FOUND:
                return constants_1.outputMessages.cityNotFound;
            case constants_1.DB_RESULT.UNKNOWN_ERROR:
                return constants_1.outputMessages.unknownError;
            default:
                return;
        }
    },
    //Build message with weather forecast for user
    buildWeatherMessage(response, city) {
        let weatherData = {};
        let weatherMessage = response.data.forecast.forecastday.length === 1 ? `Погода ` : response.data.forecast.forecastday.length === 3 ? `Погода на 3 дня в городе <b>${city}</b>🌇` : `Погода на 5 дней в городе <b>${city}</b>🌇`;
        for (let i = 0; i < response.data.forecast.forecastday.length; i++) {
            weatherData.maxTemp = Math.round(response.data.forecast.forecastday[i].day.maxtemp_c);
            weatherData.minTemp = Math.round(response.data.forecast.forecastday[i].day.mintemp_c);
            weatherData.avgWind = response.data.forecast.forecastday[i].day.avgvis_km;
            weatherData.rainChance = response.data.forecast.forecastday[i].day.daily_chance_of_rain;
            weatherData.snowChance = response.data.forecast.forecastday[i].day.daily_chance_of_snow;
            weatherData.conditionIcon = (0, utils_1.handlerConditionCode)(response.data.forecast.forecastday[i].day.condition.code);
            weatherData.avgCondition = `${response.data.forecast.forecastday[i].day.condition.text.toLowerCase()} ${weatherData.conditionIcon}`;
            weatherData.togetherDateRuFormat = (0, utils_1.changeDateRuFormat)(response.data.forecast.forecastday[i].date);
            weatherData.stringSnowChance = weatherData.minTemp > 0 ? "" : `\nВероятность снега: <b>${weatherData.snowChance}%</b> ❄️`;
            if (response.data.forecast.forecastday.length === 1) {
                weatherMessage += `<b>${weatherData.togetherDateRuFormat}</b> в городе <b>${city}</b>🌇\nБольшую часть дня будет <b>${weatherData.avgCondition}</b>\nТемпература: от <b>${weatherData.minTemp}℃</b> ⬇️ до <b>${weatherData.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${weatherData.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${weatherData.rainChance}%</b> 🌧${weatherData.stringSnowChance}`;
            }
            else {
                weatherMessage += `\n\n<b>${weatherData.togetherDateRuFormat}</b>\nБольшую часть дня будет <b>${weatherData.avgCondition}</b>\nТемпература: от <b>${weatherData.minTemp}℃</b> ⬇️ до <b>${weatherData.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${weatherData.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${weatherData.rainChance}%</b> 🌧${weatherData.stringSnowChance}`;
            }
        }
        return weatherMessage;
    },
    //Weather forecast for 1 day by date
    async forecastByDate(chatId, date) {
        const city = await usersRepository_1.usersRepository.foundCityByUserChatId(chatId);
        const cityError = this.handlerCityError(city);
        if (cityError) {
            return cityError;
        }
        const response = await apiRequestClient_1.apiRequestClient.forecastDate(city, date);
        if (response === constants_1.API_RESULT.UNKNOWN_ERROR) {
            return constants_1.outputMessages.unknownError;
        }
        return this.buildWeatherMessage(response, city);
    },
    //Weather forecast for 3 days
    async forecastThreeDays(chatId) {
        const city = await usersRepository_1.usersRepository.foundCityByUserChatId(chatId);
        const cityError = this.handlerCityError(city);
        if (cityError) {
            return cityError;
        }
        const response = await apiRequestClient_1.apiRequestClient.forecastDays(city, 3);
        if (response === constants_1.API_RESULT.UNKNOWN_ERROR) {
            return constants_1.outputMessages.unknownError;
        }
        return this.buildWeatherMessage(response, city);
    },
    /*
    Weather forecast for 5 days. First 3 days request one method, the other two days we request by date
    Made due to weather app limitations on the free plan
     */
    async forecastFiveDays(chatId) {
        const city = await usersRepository_1.usersRepository.foundCityByUserChatId(chatId);
        const cityError = this.handlerCityError(city);
        if (cityError) {
            return cityError;
        }
        const response = await apiRequestClient_1.apiRequestClient.forecastDays(city, 3);
        if (response === constants_1.API_RESULT.UNKNOWN_ERROR) {
            return constants_1.outputMessages.unknownError;
        }
        //Form dates for the fourth and fifth days
        const currentDate1 = new Date();
        const fourthDayDate = currentDate1.setDate(currentDate1.getDate() + 3);
        const fourthDayDateISO = currentDate1.toISOString();
        const currentDate2 = new Date();
        const fifthDayDate = currentDate2.setDate(currentDate2.getDate() + 4);
        const fifthDayDateISO = currentDate2.toISOString();
        //Fourth day. Make a request by date and add the result to the previously received response.
        const responseFourthDay = await apiRequestClient_1.apiRequestClient.forecastDate(city, fourthDayDateISO);
        if (responseFourthDay === constants_1.API_RESULT.UNKNOWN_ERROR) {
            return constants_1.outputMessages.unknownError;
        }
        response.data.forecast.forecastday.push(responseFourthDay.data.forecast.forecastday[0]);
        //Fifth day
        const responseFifthDay = await apiRequestClient_1.apiRequestClient.forecastDate(city, fifthDayDateISO);
        if (responseFifthDay === constants_1.API_RESULT.UNKNOWN_ERROR) {
            return constants_1.outputMessages.unknownError;
        }
        response.data.forecast.forecastday.push(responseFifthDay.data.forecast.forecastday[0]);
        //Form text message, transmitting the entire received response
        return this.buildWeatherMessage(response, city);
    }
};
