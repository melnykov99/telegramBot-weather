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
    const city = ctx.message.text;
    try {
        const response = yield axios_1.default.get(`${host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`);
        console.log(response.data);
        const answer = `Погода в городе ${response.data.location.name} \nТемпература: ${response.data.current.temp_c} \nСостояние: ${response.data.current.condition.text} \nСкорость ветра: ${response.data.current.wind_mph} м/с`;
        yield ctx.reply(answer);
    }
    catch (error) {
        console.log(error);
        yield ctx.reply('Ошибка при попытке узнать погоду. Проверьте название города или попробуйте позже.');
    }
}));
bot.start();
