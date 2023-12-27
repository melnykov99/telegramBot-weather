import axios from "axios";
import {API_RESULT} from "./constants";
import dotenv from "dotenv";

dotenv.config();


const weatherApiKey: string | undefined = process.env.WEATHER_API_KEY;
const weatherHost: string = "https://api.weatherapi.com/v1";

//Methods for requesting weather via app.weatherapi.com
export const apiRequestClient = {
    //Request forecast by date in format yyyy-mm-dd
    async forecastDate(city: string, date: string) {
        try {
            return await axios.get(`${weatherHost}/forecast.json?key=${weatherApiKey}&q=${city}&lang=ru&date=${date}`);
        } catch (error) {
            return API_RESULT.UNKNOWN_ERROR;
        }
    },
    //Request weather for several days. Free API plan is limited, maximum 3 days
    async forecastDays(city: string, days: number) {
        try {
            return await axios.get(`${weatherHost}/forecast.json?key=${weatherApiKey}&q=${city}&lang=ru&days=${days}`);
        } catch (error) {
            return API_RESULT.UNKNOWN_ERROR;
        }
    },
    //Test request which use for validation city. If city exists return city name, else return error
    async checkCity(city: string) {
        try {
            const response = await axios.get(`${weatherHost}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
            return response.data.location.name;
        } catch (error) {
            return API_RESULT.UNKNOWN_ERROR;
        }

    }
}