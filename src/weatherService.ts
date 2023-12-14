import {apiRequestClient} from "./apiRequestClient";
import {changeDateRuFormat, handlerConditionCode} from "./utils";
import {API_RESULT, DB_RESULT} from "./constants";
import {usersRepository} from "./db";

export const weatherService = {
    async forecastByDate(chatId: number, date: string) {
        const city = await usersRepository.foundCityByUserChatId(chatId)
        if (city === DB_RESULT.NOT_FOUND) {
            return 'Ошибка при запросе погоды! Попробуйте нажать кнопку "Изменить город".'
        }
        if (city === DB_RESULT.UNKNOWN_ERROR) {
            return 'Ошибка при запросе погоды! Попробуйте позже.'
        }
        const response = await apiRequestClient.forecastDate(city, date)
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
        const togetherDateRuFormat = changeDateRuFormat(date)
        return `Погода <b>${togetherDateRuFormat}</b> в городе <b>${city}</b> 🌇\nБольшую часть дня будет <b>${avgCondition}</b>\nТемпература: от <b>${minTemp}℃</b> ⬇️ до <b>${maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${avgWind} м/с</b> 🌬\nВероятность дождя: <b>${rainChance}%</b> 🌧\nВероятность снега: <b>${snowChance}%</b> ❄️`
    },
    async forecastThreeDays(chatId: number) {
        const city = await usersRepository.foundCityByUserChatId(chatId)
        if (city === DB_RESULT.NOT_FOUND) {
            return 'Ошибка при запросе погоды! Попробуйте нажать кнопку "Изменить город".'
        }
        if (city === DB_RESULT.UNKNOWN_ERROR) {
            return 'Ошибка при запросе погоды! Попробуйте позже.'
        }
        const response = await apiRequestClient.forecastDays(city, 3)
        if (response === API_RESULT.UNKNOWN_ERROR) {
            return 'Ошибка при запросе погоды! Попробуйте позже.'
        }
        const firstDayProp = {
            maxTemp: response.data.forecast.forecastday[0].day.maxtemp_c,
            minTemp: response.data.forecast.forecastday[0].day.mintemp_c,
            avgWind: response.data.forecast.forecastday[0].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[0].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[0].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[0].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[0].day.condition.text.toLowerCase()} ${firstDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[0].date)
        }
        const firstDayAnswer = `<b>${firstDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${firstDayProp.avgCondition()}</b>\nТемпература: от <b>${firstDayProp.minTemp}℃</b> ⬇️ до <b>${firstDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${firstDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${firstDayProp.rainChance}%</b> 🌧\nВероятность снега: <b>${firstDayProp.snowChance}%</b> ❄️`
        const secondDayProp = {
            maxTemp: response.data.forecast.forecastday[1].day.maxtemp_c,
            minTemp: response.data.forecast.forecastday[1].day.mintemp_c,
            avgWind: response.data.forecast.forecastday[1].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[1].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[1].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[1].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[1].day.condition.text.toLowerCase()} ${secondDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[1].date)
        }
        const secondDayAnswer = `<b>${secondDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${secondDayProp.avgCondition()}</b>\nТемпература: от <b>${secondDayProp.minTemp}℃</b> ⬇️ до <b>${secondDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${secondDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${secondDayProp.rainChance}%</b> 🌧\nВероятность снега: <b>${secondDayProp.snowChance}%</b> ❄️`
        const thirdDayProp = {
            maxTemp: response.data.forecast.forecastday[2].day.maxtemp_c,
            minTemp: response.data.forecast.forecastday[2].day.mintemp_c,
            avgWind: response.data.forecast.forecastday[2].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[2].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[2].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[2].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[2].day.condition.text.toLowerCase()} ${thirdDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[2].date)
        }
        const thirdDayAnswer = `<b>${thirdDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${thirdDayProp.avgCondition()}</b>\nТемпература: от <b>${thirdDayProp.minTemp}℃</b> ⬇️ до <b>${thirdDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${thirdDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${thirdDayProp.rainChance}%</b> 🌧\nВероятность снега: <b>${thirdDayProp.snowChance}%</b> ❄️`
        return `Погода на 3 дня в городе <b>${city}</b>\n\n${firstDayAnswer}\n\n${secondDayAnswer}\n\n${thirdDayAnswer}`
    }
}