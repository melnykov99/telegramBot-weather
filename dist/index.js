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
const apiRequestClient_1 = require("./apiRequestClient");
const constants_1 = require("./constants");
const db_1 = require("./db");
const weatherService_1 = require("./weatherService");
dotenv_1.default.config();
const tgBotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new grammy_1.Bot(tgBotToken);
//Реакция на команду /start. Просим пользователя написать свой город
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("Напиши в сообщении свой <b>город</b>❗️  \nЯ буду ежедневно в 0️⃣6️⃣:3️⃣0️⃣ отправлять прогноз погоды. ", { parse_mode: "HTML" });
}));
bot.hears("Погода сегодня 🌞", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const answer = yield weatherService_1.weatherService.forecastTogether(ctx.chat.id);
    yield ctx.reply(answer, { parse_mode: "HTML" });
}));
//Реакция на произвольное сообщение
//Произвольное взаимодейтсвие с ботом должно быть только вначале, когда пользователь пишет свой город
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    //клавиатура с кнопками, будем выводить при ответе
    const startKeyboard = new grammy_1.Keyboard()
        .text('Погода сегодня 🌞').text('Погода завтра 🌅').row()
        .text('Прогноз 3 дня 📊').text('Прогноз 7 дней 🔮').row()
        .text('Изменить город 🌇');
    //Если в сообщении нет текста, то сообщаем об ошибке.
    const city = ctx.message.text;
    const chatId = ctx.chat.id;
    if (!city) {
        yield ctx.reply('Ошибка! Я умею читать только названия городов. Пришли, пожалуйста, свой город.');
        return;
    }
    //Ищем пользователя в БД
    const checkUserInDB = yield db_1.usersRepository.foundUserByChatId(chatId);
    //Если пользователь добавлен в БД, то писать он нам не должен. Нужно на кнопки нажимать.
    if (checkUserInDB[0].city) {
        yield ctx.reply(`У тебя установлен город ${checkUserInDB[0].city}. Нужно изменить? Нажми соответствующую кнопку.`, { reply_markup: startKeyboard });
        return;
    }
    //Проверяем город, для этого отправляем тестовый запрос к апи погоды.
    const checkedCity = yield apiRequestClient_1.apiRequestClient.checkCity(city);
    if (checkedCity === constants_1.API_RESULT.UNKNOWN_ERROR) {
        yield ctx.reply('Ошибка! Я не смог найти такой город. Проверь название или попробуй написать позже.');
        return;
    }
    //Добавляем пользователя и его город в БД
    yield db_1.usersRepository.addUser(chatId, checkedCity);
    //Сообщаем, что всё ок и теперь будет приходить ежедневный прогноз. Рассказываем о возможностях бота
    yield ctx.reply('Принято ✅ \nТеперь ежедневно буду отправлять прогноз погоды.😊\nМожно запрашивать прогноз вручную на сегодня, завтра 3 и 7 дней, для этого нажимай соответствующие кнопки.\n', { reply_markup: startKeyboard });
    return;
}));
bot.start();
