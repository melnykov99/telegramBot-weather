import axios from "axios";
import {API_RESULT} from "./constants";
import dotenv from "dotenv";

dotenv.config();

const weatherApiKey = process.env.WEATHER_API_KEY;
const weather_host = 'https://api.weatherapi.com/v1';

export const apiRequestClient = {
    // текущая погода
    async currentWeather(city: string) {
        try {
            return await axios.get(`${weather_host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
        } catch (error) {
            return API_RESULT.UNKNOWN_ERROR
        }
    },
    // запрос погоды по дате
    async forecastDate(city: string, date: string) {
        try {
            return await axios.get(`${weather_host}/forecast.json?key=${weatherApiKey}&q=${city}&lang=ru&date=${date}`)
        } catch (error) {
            return API_RESULT.UNKNOWN_ERROR
        }
    },
    // запрос погоды на определенное количество дней
    async forecastDays(city: string, days: number) {
        try {
            return await axios.get(`${weather_host}/forecast.json?key=${weatherApiKey}&q=${city}&lang=ru&days=${days}`)
        } catch (error) {
            return API_RESULT.UNKNOWN_ERROR
        }
    },
    // тестовый запрос текущей погоды. Выполняется чтобы определить существующий ли город ввел пользователью
    async checkCity(city: string) {
        try {
            const response = await axios.get(`${weather_host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
            return response.data.location.name
        } catch (error) {
            return API_RESULT.UNKNOWN_ERROR
        }

    }
}