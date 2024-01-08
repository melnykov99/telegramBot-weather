import {apiRequestClient} from "./apiRequestClient";
import {changeDateRuFormat, handlerConditionCode} from "./utils";
import {API_RESULT, DB_RESULT, outputMessages} from "./constants";
import {usersRepository} from "./usersRepository";
import {AxiosResponse} from "axios";

//Main logic api. Requests to the weather API and generation of a message for the user
export const weatherService = {
    //Checking the city name from the database. If the name is not found or an error occurs, return the corresponding text
    handlerCityError(city: string): string | undefined {
        switch (city) {
            case DB_RESULT.NOT_FOUND:
                return outputMessages.cityNotFound;
            case DB_RESULT.UNKNOWN_ERROR:
                return outputMessages.unknownError;
            default:
                return;
        }
    },
    //Build message with weather forecast for user
    buildWeatherMessage(response: AxiosResponse, city: string): string {
        let weatherData: any = {};
        let weatherMessage: string = response.data.days.length === 1 ? `Погода ` : response.data.days.length === 3 ? `Погода на 3 дня в городе <b>${city}</b>🌇` : `Погода на 5 дней в городе <b>${city}</b>🌇`;
        for (let i = 0; i < response.data.days.length; i++) {
            weatherData.maxTemp = Math.round(response.data.days[i].tempmax);
            weatherData.minTemp = Math.round(response.data.days[i].tempmin);
            weatherData.avgWind = response.data.days[i].windspeed;
            weatherData.precipprob = response.data.days[i].precipprob;
            weatherData.preciptype = response.data.days[i].preciptype;
            weatherData.avgCondition = `${response.data.days[i].conditions}`;
            weatherData.todayDateRuFormat = changeDateRuFormat(response.data.days[i].datetime);
            if (response.data.days.length === 1) {
                weatherMessage += `<b>${weatherData.todayDateRuFormat}</b> в городе <b>${city}</b>🌇\nБольшую часть дня будет <b>${weatherData.avgCondition}</b>\nТемпература: от <b>${weatherData.minTemp}℃</b> ⬇️ до <b>${weatherData.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${weatherData.avgWind} м/с</b> 🌬\nВероятность осадков: <b>${weatherData.precipprob}%</b>`;
            } else {
                weatherMessage += `\n\n<b>${weatherData.todayDateRuFormat}</b>\nБольшую часть дня будет <b>${weatherData.avgCondition}</b>\nТемпература: от <b>${weatherData.minTemp}℃</b> ⬇️ до <b>${weatherData.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${weatherData.avgWind} м/с</b> 🌬\nВероятность осадков: <b>${weatherData.precipprob}%</b>`;
            }
        }
        return weatherMessage;
    },
    //Weather forecast
    async forecastRequest(chatId: number, period: string): Promise<string> {
        const city = await usersRepository.foundCityByUserChatId(chatId);
        const cityError: string | undefined = this.handlerCityError(city);
        if (cityError) {
            return cityError;
        }
        const response: AxiosResponse | API_RESULT.UNKNOWN_ERROR = await apiRequestClient.forecastRequest(city, period);
        if (response === API_RESULT.UNKNOWN_ERROR) {
            return outputMessages.unknownError;
        }
        return this.buildWeatherMessage(response, city);
    }
}