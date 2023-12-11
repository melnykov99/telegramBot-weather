import {Bot, Keyboard} from "grammy";
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const tgBotToken: string | undefined = process.env.TELEGRAM_BOT_TOKEN;
const weatherApiKey = process.env.WEATHER_API_KEY;
const host = 'https://api.weatherapi.com/v1';

const bot = new Bot(tgBotToken!);
bot.command("start", (ctx) => ctx.reply("Напишите в сообщении город, чтобы получить погоду."))

bot.on("message", async (ctx) => {
    const startKeyboard = new Keyboard()
        .text('Погода сегодня 🌞').text('Погода завтра 🌅').row()
        .text('Прогноз на 3 дня 📊').text('Прогноз на 7 дней 🔮')

    const city: string | undefined = ctx.message.text;
    try {
        const response = await axios.get(`${host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
        const temperatureText: string = response.data.current.temp_c < 0 ? `Температура: ${response.data.current.temp_c}°C🥶` : `Температура: ${response.data.current.temp_c}°C😊` ;
        let conditionText: string = '';
        switch (response.data.current.condition.code) {
            case 1000:
                conditionText = `На улице ${response.data.current.condition.text} ☀️`;
                break;
            case 1003:
            case 1006:
            case 1009:
            case 1030:
            case 1135:
            case 1147:
                conditionText = `На улице ${response.data.current.condition.text} ☁️`;
                break;
            case 1063:
            case 1072:
            case 1087:
            case 1150:
            case 1153:
            case 1168:
            case 1171:
            case 1180:
            case 1183:
            case 1186:
            case 1189:
            case 1192:
            case 1195:
            case 1198:
            case 1201:
            case 1240:
            case 1243:
            case 1246:
            case 1249:
            case 1252:
            case 1261:
            case 1264:
            case 1273:
            case 1276:
                conditionText = `На улице ${response.data.current.condition.text} 🌧`;
                break;
            case 1066:
            case 1069:
            case 1114:
            case 1117:
            case 1204:
            case 1207:
            case 1210:
            case 1213:
            case 1216:
            case 1219:
            case 1222:
            case 1225:
            case 1237:
            case 1255:
            case 1258:
            case 1279:
            case 1282:
                conditionText = `На улице ${response.data.current.condition.text} ❄️`;
                break;
            default:
                conditionText = `На улице ${response.data.current.condition.text}!`;
        }

        const windText = `Скорость ветра: ${response.data.current.wind_mph} м/с💨`;
        const fullAnswer = `Погода в городе <b>${response.data.location.name}</b> 🌇\n${temperatureText} \n${conditionText} \n${windText}`;
        await ctx.reply(fullAnswer, {reply_markup: startKeyboard, parse_mode: "HTML"},);
    } catch (error) {
        console.log(error);
        await ctx.reply('Ошибка при попытке узнать погоду. Проверьте название города или попробуйте позже.')
    }
});


bot.start();