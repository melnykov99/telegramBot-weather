import {apiRequestClient} from "./apiRequestClient";
import {changeDateRuFormat, handlerConditionCode} from "./utils";
import {API_RESULT, DB_RESULT} from "./constants";
import {usersRepository} from "./db";

export const weatherService = {
    async forecastTogether(chatId: number) {
        const city = await usersRepository.foundCityByUserChatId(chatId)
        if (city === DB_RESULT.NOT_FOUND) {
            return 'Ошибка при запросе погоды! Попробуйте нажать кнопку "Изменить город".'
        }
        if (city === DB_RESULT.UNKNOWN_ERROR) {
            return 'Ошибка при запросе погоды! Попробуйте позже.'
        }
        const togetherDate: string = new Date().toISOString().split('T')[0]
        const togetherDateRuFormat = changeDateRuFormat(togetherDate)
        const response = await apiRequestClient.forecastDate(city, togetherDate)
        if (response === API_RESULT.UNKNOWN_ERROR) {
            return 'Ошибка при запросе погоды! Попробуйте позже.'
        }
        const maxTemp = response.data.forecast.forecastday[0].day.maxtemp_c
        const minTemp = response.data.forecast.forecastday[0].day.mintemp_c
        const avgWind = response.data.forecast.forecastday[0].day.avgvis_km
        const rainChance = response.data.forecast.forecastday[0].day.daily_chance_of_rain
        const snowChance = response.data.forecast.forecastday[0].day.daily_chance_of_snow
        const conditionIcon: string = handlerConditionCode(response.data.forecast.forecastday[0].day.condition.code)
        const avgCondition = `${response.data.forecast.forecastday[0].day.condition.text.toLowerCase()} ${conditionIcon}`
        return `Погода <b>${togetherDateRuFormat}</b> в городе <b>${city}</b> 🌇\nБольшую часть дня будет <b>${avgCondition}</b>\nТемпература: от <b>${minTemp}℃</b> ⬇️ до <b>${maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${avgWind} м/с</b> 🌬\nВероятность дождя: <b>${rainChance}%</b> 🌧\nВероятность снега: <b>${snowChance}%</b> ❄️`
    },
    async forecastTomorrow() {

    },
    async forecastThreeDays() {

    },
    async forecastSevenDays() {

    }
}