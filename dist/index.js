"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const tgBotToken = process.env.TELEGRAM_BOT_TOKEN;
const weatherApiKey = process.env.WEATHER_API_KEY;
const host = 'https://api.weatherapi.com/v1';
const bot = new grammy_1.Bot(tgBotToken);
bot.command("start", (ctx) => ctx.reply("Напишите в сообщении город, чтобы получить погоду."));
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const startKeyboard = new grammy_1.Keyboard()
        .text('Погода сегодня 🌞').text('Погода завтра 🌅').row()
        .text('Прогноз на 3 дня 📊').text('Прогноз на 7 дней 🔮');
    const city = ctx.message.text;
    try {
        const response = yield axios_1.default.get(`${host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
        const temperatureText = response.data.current.temp_c < 0 ? `Температура: ${response.data.current.temp_c}°C🥶` : `Температура: ${response.data.current.temp_c}°C😊`;
        let conditionText = '';
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
        yield ctx.reply(fullAnswer, { reply_markup: startKeyboard, parse_mode: "HTML" });
    }
    catch (error) {
        console.log(error);
        yield ctx.reply('Ошибка при попытке узнать погоду. Проверьте название города или попробуйте позже.');
    }
}));
bot.start();
