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
    buildWeatherMessage(response: AxiosResponse, date: string, city: string): string {
        let weatherData: any = {}
        let weatherMessage: string = `Погода `
        for(let i = 0; i < response.data.forecast.forecastday.length; i++) {
            weatherData.maxTemp = Math.round(response.data.forecast.forecastday[i].day.maxtemp_c);
            weatherData.minTemp = Math.round(response.data.forecast.forecastday[i].day.mintemp_c);
            weatherData.avgWind = response.data.forecast.forecastday[i].day.avgvis_km;
            weatherData.rainChance = response.data.forecast.forecastday[i].day.daily_chance_of_rain;
            weatherData.snowChance = response.data.forecast.forecastday[i].day.daily_chance_of_snow;
            weatherData.conditionIcon = handlerConditionCode(response.data.forecast.forecastday[i].day.condition.code);
            weatherData.avgCondition = `${response.data.forecast.forecastday[i].day.condition.text.toLowerCase()} ${weatherData.conditionIcon}`;
            weatherData.togetherDateRuFormat = changeDateRuFormat(date);
            weatherData.stringSnowChance = weatherData.minTemp > 0 ? '' : `\nВероятность снега: <b>${weatherData.snowChance}%</b> ❄️`
        }
        return weatherMessage += `<b>${weatherData.togetherDateRuFormat}</b> в городе <b>${city}</b> 🌇\nБольшую часть дня будет <b>${weatherData.avgCondition}</b>\nТемпература: от <b>${weatherData.minTemp}℃</b> ⬇️ до <b>${weatherData.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${weatherData.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${weatherData.rainChance}%</b> 🌧${weatherData.stringSnowChance}`
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
        return this.buildWeatherMessage(response, date, city)
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
            stringSnowChance: () => firstDayProp.minTemp > 0 ? '' : `\nВероятность снега: <b>${firstDayProp.snowChance}%</b> ❄️`
        }
        const firstDayAnswer = `<b>${firstDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${firstDayProp.avgCondition()}</b>\nТемпература: от <b>${firstDayProp.minTemp}℃</b> ⬇️ до <b>${firstDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${firstDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${firstDayProp.rainChance}%</b> 🌧${firstDayProp.stringSnowChance()}`
        const secondDayProp = {
            maxTemp: Math.round(response.data.forecast.forecastday[1].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[1].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[1].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[1].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[1].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[1].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[1].day.condition.text.toLowerCase()} ${secondDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[1].date),
            stringSnowChance: () => secondDayProp.minTemp > 0 ? '' : `\nВероятность снега: <b>${secondDayProp.snowChance}%</b> ❄️`
        }
        const secondDayAnswer = `<b>${secondDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${secondDayProp.avgCondition()}</b>\nТемпература: от <b>${secondDayProp.minTemp}℃</b> ⬇️ до <b>${secondDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${secondDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${secondDayProp.rainChance}%</b> 🌧${secondDayProp.stringSnowChance()}`
        const thirdDayProp = {
            maxTemp: Math.round(response.data.forecast.forecastday[2].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[2].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[2].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[2].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[2].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[2].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[2].day.condition.text.toLowerCase()} ${thirdDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[2].date),
            stringSnowChance: () => thirdDayProp.minTemp > 0 ? '' : `\nВероятность снега: <b>${thirdDayProp.snowChance}%</b> ❄️`
        }
        const thirdDayAnswer = `<b>${thirdDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${thirdDayProp.avgCondition()}</b>\nТемпература: от <b>${thirdDayProp.minTemp}℃</b> ⬇️ до <b>${thirdDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${thirdDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${thirdDayProp.rainChance}%</b> 🌧${thirdDayProp.stringSnowChance()}`
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
            stringSnowChance: () => firstDayProp.minTemp > 0 ? '' : `\nВероятность снега: <b>${firstDayProp.snowChance}%</b> ❄️`
        }
        const firstDayAnswer = `<b>${firstDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${firstDayProp.avgCondition()}</b>\nТемпература: от <b>${firstDayProp.minTemp}℃</b> ⬇️ до <b>${firstDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${firstDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${firstDayProp.rainChance}%</b> 🌧${firstDayProp.stringSnowChance()}`
        const secondDayProp = {
            maxTemp: Math.round(response.data.forecast.forecastday[1].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[1].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[1].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[1].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[1].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[1].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[1].day.condition.text.toLowerCase()} ${secondDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[1].date),
            stringSnowChance: () => secondDayProp.minTemp > 0 ? '' : `\nВероятность снега: <b>${secondDayProp.snowChance}%</b> ❄️`
        }
        const secondDayAnswer = `<b>${secondDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${secondDayProp.avgCondition()}</b>\nТемпература: от <b>${secondDayProp.minTemp}℃</b> ⬇️ до <b>${secondDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${secondDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${secondDayProp.rainChance}%</b> 🌧${secondDayProp.stringSnowChance()}`
        const thirdDayProp = {
            maxTemp: Math.round(response.data.forecast.forecastday[2].day.maxtemp_c),
            minTemp: Math.round(response.data.forecast.forecastday[2].day.mintemp_c),
            avgWind: response.data.forecast.forecastday[2].day.avgvis_km,
            rainChance: response.data.forecast.forecastday[2].day.daily_chance_of_rain,
            snowChance: response.data.forecast.forecastday[2].day.daily_chance_of_snow,
            conditionIcon: handlerConditionCode(response.data.forecast.forecastday[2].day.condition.code),
            avgCondition: () => `${response.data.forecast.forecastday[2].day.condition.text.toLowerCase()} ${thirdDayProp.conditionIcon}`,
            dateRuFormat: changeDateRuFormat(response.data.forecast.forecastday[2].date),
            stringSnowChance: () => thirdDayProp.minTemp > 0 ? '' : `\nВероятность снега: <b>${thirdDayProp.snowChance}%</b> ❄️`
        }
        const thirdDayAnswer = `<b>${thirdDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${thirdDayProp.avgCondition()}</b>\nТемпература: от <b>${thirdDayProp.minTemp}℃</b> ⬇️ до <b>${thirdDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${thirdDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${thirdDayProp.rainChance}%</b> 🌧${thirdDayProp.stringSnowChance()}`

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
            stringSnowChance: () => fourthDayProp.minTemp > 0 ? '' : `\nВероятность снега: <b>${fourthDayProp.snowChance}%</b> ❄️`
        }
        const fourthDayAnswer = `<b>${fourthDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${fourthDayProp.avgCondition()}</b>\nТемпература: от <b>${fourthDayProp.minTemp}℃</b> ⬇️ до <b>${fourthDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${fourthDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${fourthDayProp.rainChance}%</b> 🌧${fourthDayProp.stringSnowChance()}`
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
            stringSnowChance: () => fifthDayProp.minTemp > 0 ? '' : `\nВероятность снега: <b>${fifthDayProp.snowChance}%</b> ❄️`
        }
        const fifthDayAnswer = `<b>${fifthDayProp.dateRuFormat}</b>\nБольшую часть дня будет <b>${fifthDayProp.avgCondition()}</b>\nТемпература: от <b>${fifthDayProp.minTemp}℃</b> ⬇️ до <b>${fifthDayProp.maxTemp}℃</b> ⬆️\nСкорость ветра: <b>${fifthDayProp.avgWind} м/с</b> 🌬\nВероятность дождя: <b>${fifthDayProp.rainChance}%</b> 🌧${fifthDayProp.stringSnowChance()}`
        return `Погода на 5 дней в городе <b>${city}</b>🌇\n\n${firstDayAnswer}\n\n${secondDayAnswer}\n\n${thirdDayAnswer}\n\n${fourthDayAnswer}\n\n${fifthDayAnswer}`
    }
}