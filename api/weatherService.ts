import {apiRequestClient} from "./apiRequestClient";
import {changeDateRuFormat, handlerConditionCode} from "./utils";
import {API_RESULT, DB_RESULT} from "./constants";
import {usersRepository} from "./usersRepository";

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
        const maxTemp = Math.round(response.data.forecast.forecastday[0].day.maxtemp_c)
        const minTemp = Math.round(response.data.forecast.forecastday[0].day.mintemp_c)
        const avgWind = response.data.forecast.forecastday[0].day.avgvis_km
        const rainChance = response.data.forecast.forecastday[0].day.daily_chance_of_rain
        const snowChance = response.data.forecast.forecastday[0].day.daily_chance_of_snow
        const conditionIcon: string = handlerConditionCode(response.data.forecast.forecastday[0].day.condition.code)
        const avgCondition = `${response.data.forecast.forecastday[0].day.condition.text.toLowerCase()} ${conditionIcon}`
        const togetherDateRuFormat = changeDateRuFormat(date)
        const stringSnowChance = minTemp > 0 ? '' : `Вероятность снега: <b>${snowChance}%</b> ❄️`
        return `Погода <b>${togetherDateRuFormat}</b> в городе <b>${city}</b> 🌇\nБольшую часть дня будет <b>${avgCondition}</b>\nТемпература: от <b>${minTemp}℃</b> ⬇️ до <b>${maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${avgWind} м/с</b> 🌬\nВероятность дождя: <b>${rainChance}%</b> 🌧\n${stringSnowChance}`
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
            maxTemp: Math.round(response.data.forecast.forecastday[0].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[0].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[0].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[0].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[0].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[0].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[0].day.condition.text.toLowerCase()} ${firstDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[0].date),
            stringSnowChance: () => firstDayProp.minTemp > 0 ? '' : `Вероятность снега: <b>${firstDayProp.snowChance}%</b> ❄️`
        }
        const firstDayAnswer = `<b>${firstDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${firstDayProp.avgCondition()}</b>\nТемпература: от <b>${firstDayProp.minTemp}℃</b> ⬇️ до <b>${firstDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${firstDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${firstDayProp.rainChance}%</b> 🌧\n${firstDayProp.stringSnowChance()}`
        const secondDayProp = {
            maxTemp: Math.round(response.data.forecast.forecastday[1].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[1].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[1].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[1].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[1].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[1].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[1].day.condition.text.toLowerCase()} ${secondDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[1].date),
            stringSnowChance: () => secondDayProp.minTemp > 0 ? '' : `Вероятность снега: <b>${secondDayProp.snowChance}%</b> ❄️`
        }
        const secondDayAnswer = `<b>${secondDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${secondDayProp.avgCondition()}</b>\nТемпература: от <b>${secondDayProp.minTemp}℃</b> ⬇️ до <b>${secondDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${secondDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${secondDayProp.rainChance}%</b> 🌧\n${secondDayProp.stringSnowChance()}`
        const thirdDayProp = {
            maxTemp: Math.round(response.data.forecast.forecastday[2].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[2].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[2].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[2].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[2].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[2].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[2].day.condition.text.toLowerCase()} ${thirdDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[2].date),
            stringSnowChance: () => thirdDayProp.minTemp > 0 ? '' : `Вероятность снега: <b>${thirdDayProp.snowChance}%</b> ❄️`
        }
        const thirdDayAnswer = `<b>${thirdDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${thirdDayProp.avgCondition()}</b>\nТемпература: от <b>${thirdDayProp.minTemp}℃</b> ⬇️ до <b>${thirdDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${thirdDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${thirdDayProp.rainChance}%</b> 🌧\n${thirdDayProp.stringSnowChance()}`
        return `Погода на 3 дня в городе <b>${city}🌇</b>\n\n${firstDayAnswer}\n\n${secondDayAnswer}\n\n${thirdDayAnswer}`
    },
    async forecastFiveDays(chatId: number) {
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
            maxTemp: Math.round(response.data.forecast.forecastday[0].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[0].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[0].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[0].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[0].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[0].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[0].day.condition.text.toLowerCase()} ${firstDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[0].date),
            stringSnowChance: () => firstDayProp.minTemp > 0 ? '' : `Вероятность снега: <b>${firstDayProp.snowChance}%</b> ❄️`
        }
        const firstDayAnswer = `<b>${firstDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${firstDayProp.avgCondition()}</b>\nТемпература: от <b>${firstDayProp.minTemp}℃</b> ⬇️ до <b>${firstDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${firstDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${firstDayProp.rainChance}%</b> 🌧\n${firstDayProp.stringSnowChance()}`
        const secondDayProp = {
            maxTemp: Math.round(response.data.forecast.forecastday[1].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[1].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[1].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[1].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[1].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[1].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[1].day.condition.text.toLowerCase()} ${secondDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[1].date),
            stringSnowChance: () => secondDayProp.minTemp > 0 ? '' : `Вероятность снега: <b>${secondDayProp.snowChance}%</b> ❄️`
        }
        const secondDayAnswer = `<b>${secondDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${secondDayProp.avgCondition()}</b>\nТемпература: от <b>${secondDayProp.minTemp}℃</b> ⬇️ до <b>${secondDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${secondDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${secondDayProp.rainChance}%</b> 🌧\n${secondDayProp.stringSnowChance()}`
        const thirdDayProp = {
            maxTemp: Math.round(response.data.forecast.forecastday[2].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[2].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[2].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[2].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[2].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[2].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[2].day.condition.text.toLowerCase()} ${thirdDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[2].date),
            stringSnowChance: () => thirdDayProp.minTemp > 0 ? '' : `Вероятность снега: <b>${thirdDayProp.snowChance}%</b> ❄️`
        }
        const thirdDayAnswer = `<b>${thirdDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${thirdDayProp.avgCondition()}</b>\nТемпература: от <b>${thirdDayProp.minTemp}℃</b> ⬇️ до <b>${thirdDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${thirdDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${thirdDayProp.rainChance}%</b> 🌧\n${thirdDayProp.stringSnowChance()}`

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
            return 'Ошибка при запросе погоды! Попробуйте позже.'
        }
        const fourthDayProp = {
            maxTemp: Math.round(responseFourthDay.data.forecast.forecastday[0].day.maxtemp_c),
            minTemp: Math.round(responseFourthDay.data.forecast.forecastday[0].day.mintemp_c),
            avgWind: responseFourthDay.data.forecast.forecastday[0].day.avgvis_km,
            rainChance: responseFourthDay.data.forecast.forecastday[0].day.daily_chance_of_rain,
            snowChance: responseFourthDay.data.forecast.forecastday[0].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(responseFourthDay.data.forecast.forecastday[0].day.condition.code),
            avgCondition: () => `${responseFourthDay.data.forecast.forecastday[0].day.condition.text.toLowerCase()} ${fourthDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(responseFourthDay.data.forecast.forecastday[0].date),
            stringSnowChance: () => fourthDayProp.minTemp > 0 ? '' : `Вероятность снега: <b>${fourthDayProp.snowChance}%</b> ❄️`
        }
        const fourthDayAnswer = `<b>${fourthDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${fourthDayProp.avgCondition()}</b>\nТемпература: от <b>${fourthDayProp.minTemp}℃</b> ⬇️ до <b>${fourthDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${fourthDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${fourthDayProp.rainChance}%</b> 🌧\n${fourthDayProp.stringSnowChance()}`
        //Пятый день
        const responseFifthDay = await apiRequestClient.forecastDate(city, fifthDayDateISO)
        if (responseFifthDay === API_RESULT.UNKNOWN_ERROR) {
            return 'Ошибка при запросе погоды! Попробуйте позже.'
        }
        const fifthDayProp = {
            maxTemp: Math.round(responseFifthDay.data.forecast.forecastday[0].day.maxtemp_c),
            minTemp: Math.round(responseFifthDay.data.forecast.forecastday[0].day.mintemp_c),
            avgWind: responseFifthDay.data.forecast.forecastday[0].day.avgvis_km,
            rainChance: responseFifthDay.data.forecast.forecastday[0].day.daily_chance_of_rain,
            snowChance: responseFifthDay.data.forecast.forecastday[0].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(responseFifthDay.data.forecast.forecastday[0].day.condition.code),
            avgCondition: () => `${responseFifthDay.data.forecast.forecastday[0].day.condition.text.toLowerCase()} ${fifthDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(responseFifthDay.data.forecast.forecastday[0].date),
            stringSnowChance: () => fifthDayProp.minTemp > 0 ? '' : `Вероятность снега: <b>${fifthDayProp.snowChance}%</b> ❄️`
        }
        const fifthDayAnswer = `<b>${fifthDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${fifthDayProp.avgCondition()}</b>\nТемпература: от <b>${fifthDayProp.minTemp}℃</b> ⬇️ до <b>${fifthDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${fifthDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${fifthDayProp.rainChance}%</b> 🌧\n${fifthDayProp.stringSnowChance()}`
        return `Погода на 5 дней в городе <b>${city}</b>🌇\n\n${firstDayAnswer}\n\n${secondDayAnswer}\n\n${thirdDayAnswer}\n\n${fourthDayAnswer}\n\n${fifthDayAnswer}`
    }
}