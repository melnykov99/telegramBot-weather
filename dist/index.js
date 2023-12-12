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
const requests_1 = require("./requests");
dotenv_1.default.config();
const tgBotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new grammy_1.Bot(tgBotToken);
bot.command("start", (ctx) => ctx.reply("Напишите в сообщении город, чтобы получить погоду.", { parse_mode: "HTML" }));
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const startKeyboard = new grammy_1.Keyboard()
        .text('Погода сегодня 🌞').text('Погода завтра 🌅').row()
        .text('Прогноз на 3 дня 📊').text('Прогноз на 7 дней 🔮').row()
        .text('Изменить город');
    const city = ctx.message.text;
    if (!city) {
        yield ctx.reply('Ошибка! Пожалуйста, напишите ваш город повторно');
        return;
    }
    const answer = yield (0, requests_1.currentWeather)(city);
    yield ctx.reply(answer, { reply_markup: startKeyboard, parse_mode: "HTML" });
}));
bot.start();
