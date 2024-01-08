import axios from "axios";
import {API_RESULT} from "./constants";
import dotenv from "dotenv";

dotenv.config();


const weatherApiKey: string | undefined = process.env.WEATHER_API_KEY;
const weatherHost: string = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";

//Methods for requesting weather via weather.visualcrossing.com
export const apiRequestClient = {
    //Request weather. In period may be "today", "tomorrow", "next 2 days", "next 4 days"
    async forecastRequest(city: string, period: string) {
        try {
            return await axios.get(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Rostov-on-Don/today/?key=${weatherApiKey}&lang=ru&unitGroup=uk&include=days`);
        } catch (error) {
            return API_RESULT.UNKNOWN_ERROR;
        }
    },
    //Test request which use for validation city. If city exists return city name, else return error
    async checkCity(city: string) {
        try {
            const response = await axios.get(`${weatherHost}/${city}/today?key=${weatherApiKey}&lang=ru&unitGroup=uk&include=days`);
            return response.data.resolvedAddress;
        } catch (error) {
            return API_RESULT.UNKNOWN_ERROR;
        }

    }
}