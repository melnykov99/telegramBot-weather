import axios from "axios";
import {handlerConditionCode, handlerTemperature} from "./utils";

const weatherApiKey = process.env.WEATHER_API_KEY;
const weather_host = 'https://api.weatherapi.com/v1';
export async function currentWeather(city: string) {
    try {
        const response = await axios.get(`${weather_host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
        const temperatureText: string = handlerTemperature(response.data.current.temp_c);
        const conditionText: string = handlerConditionCode(response.data.current.condition.code, response.data.current.condition.text)
        const windText: string = `Скорость ветра: ${response.data.current.wind_mph} м/с💨`;
        const fullAnswer: string = `Погода в городе <b>${response.data.location.name}</b> 🌇\n${temperatureText} \n${conditionText} \n${windText}`;
        return fullAnswer
    } catch (error) {
        console.log(error);
        return 'Ошибка при попытке узнать погоду. Проверьте название города или попробуйте позже.'
    }

}