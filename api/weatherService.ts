import {apiRequestClient} from "./apiRequestClient";
import {changeDateRuFormat, handlerConditionCode} from "./utils";
import {API_RESULT, DB_RESULT, outputMessages} from "./constants";
import {usersRepository} from "./usersRepository";
import {AxiosResponse} from "axios";

export const weatherService = {
    //обработчик ошибок city
    handlerCityError(city: string): string | undefined {
        switch (city) {
            case DB_RESULT.NOT_FOUND:
                return outputMessages.cityNotFound;
            case DB_RESULT.UNKNOWN_ERROR:
                return outputMessages.unknownError;
            default:
                return
        }
    },
    //формируем текст погоды
    buildWeatherMessage(response: AxiosResponse, city: string): string {
        let weatherData: any = {}
        let weatherMessage: string = response.data.forecast.forecastday.length === 1 ? `Погода ` : `Погода на 3 дня в городе ${city}🌇`
        for (let i = 0; i < response.data.forecast.forecastday.length; i++) {
            weatherData.maxTemp = Math.round(response.data.forecast.forecastday[i].day.maxtemp_c);
            weatherData.minTemp = Math.round(response.data.forecast.forecastday[i].day.mintemp_c);
            weatherData.avgWind = response.data.forecast.forecastday[i].day.avgvis_km;
            weatherData.rainChance = response.data.forecast.forecastday[i].day.daily_chance_of_rain;
            weatherData.snowChance = response.data.forecast.forecastday[i].day.daily_chance_of_snow;
            weatherData.conditionIcon = handlerConditionCode(response.data.forecast.forecastday[i].day.condition.code);
            weatherData.avgCondition = `${response.data.forecast.forecastday[i].day.condition.text.toLowerCase()} ${weatherData.conditionIcon}`;
            weatherData.togetherDateRuFormat = changeDateRuFormat(response.data.forecast.forecastday[i].date);
            weatherData.stringSnowChance = weatherData.minTemp > 0 ? '' : `\nВероятность снега: <b>${weatherData.snowChance}%</b> ❄️`

            if (response.data.forecast.forecastday.length === 1) {
                weatherMessage += `<b>${weatherData.togetherDateRuFormat}</b> в городе ${city}🌇\nБольшую часть дня будет <b>${weatherData.avgCondition}</b>\nТемпература: от <b>${weatherData.minTemp}℃</b> ⬇️ до <b>${weatherData.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${weatherData.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${weatherData.rainChance}%</b> 🌧${weatherData.stringSnowChance}`
            } else {
                weatherMessage += `\n\n<b>${weatherData.togetherDateRuFormat}</b>\nБольшую часть дня будет <b>${weatherData.avgCondition}</b>\nТемпература: от <b>${weatherData.minTemp}℃</b> ⬇️ до <b>${weatherData.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${weatherData.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${weatherData.rainChance}%</b> 🌧${weatherData.stringSnowChance}`
            }
        }
        return weatherMessage
    },
    async forecastByDate(chatId: number, date: string): Promise<string> {
        const city = await usersRepository.foundCityByUserChatId(chatId)
        const cityError: string | undefined = this.handlerCityError(city);
        if (cityError) {
            return cityError;
        }
        const response: AxiosResponse | API_RESULT.UNKNOWN_ERROR = await apiRequestClient.forecastDate(city, date)
        if (response === API_RESULT.UNKNOWN_ERROR) {
            return outputMessages.unknownError
        }
        return this.buildWeatherMessage(response, city)
    },
    async forecastThreeDays(chatId: number): Promise<string> {
        const city = await usersRepository.foundCityByUserChatId(chatId)
        const cityError: string | undefined = this.handlerCityError(city);
        if (cityError) {
            return cityError;
        }
        const response: AxiosResponse | API_RESULT.UNKNOWN_ERROR = await apiRequestClient.forecastDays(city, 3)
        if (response === API_RESULT.UNKNOWN_ERROR) {
            return outputMessages.unknownError
        }
        return this.buildWeatherMessage(response, city)
    },
    async forecastFiveDays(chatId: number): Promise<string> {
        const city = await usersRepository.foundCityByUserChatId(chatId)
        const cityError: string | undefined = this.handlerCityError(city);
        if (cityError) {
            return cityError;
        }
        const response = await apiRequestClient.forecastDays(city, 3)
        if (response === API_RESULT.UNKNOWN_ERROR) {
            return outputMessages.unknownError
        }
        //Формируем даты для четвертого и пятого дня. Запрашиваем их отдельно из-за ограничения weatherApi на бесплатном тарифе
        const currentDate1 = new Date();
        const fourthDayDate = currentDate1.setDate(currentDate1.getDate() + 3);
        const fourthDayDateISO = currentDate1.toISOString();
        const currentDate2 = new Date()
        const fifthDayDate = currentDate2.setDate(currentDate2.getDate() + 4);
        const fifthDayDateISO = currentDate2.toISOString();
        //Четвертый день
        const responseFourthDay = await apiRequestClient.forecastDate(city, fourthDayDateISO)
        if (responseFourthDay === API_RESULT.UNKNOWN_ERROR) {
            return outputMessages.unknownError
        }
        response.data.forecast.forecastday.push(responseFourthDay.data.forecast.forecastday[0])
        //Пятый день
        const responseFifthDay = await apiRequestClient.forecastDate(city, fifthDayDateISO)
        if (responseFifthDay === API_RESULT.UNKNOWN_ERROR) {
            return outputMessages.unknownError
        }
        response.data.forecast.forecastday.push(responseFifthDay.data.forecast.forecastday[0])
        return this.buildWeatherMessage(response, city)
    }
}