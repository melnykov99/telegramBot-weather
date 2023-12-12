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
const constants_1 = require("./constants");
const db_1 = require("./db");
dotenv_1.default.config();
const tgBotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new grammy_1.Bot(tgBotToken);
//Реакция на команду /start. Просим пользователя написать свой город
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("Напиши в сообщении свой <b>город</b>❗️  \nЯ буду ежедневно в 0️⃣6️⃣:3️⃣0️⃣ отправлять прогноз погоды. ", { parse_mode: "HTML" });
}));
//Реакция на произвольное сообщение
//Произвольное взаимодейтсвие с ботом должно быть только вначале, когда пользователь пишет свой город
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    //клавиатура с кнопками
    const startKeyboard = new grammy_1.Keyboard()
        .text('Погода сегодня 🌞').text('Погода завтра 🌅').row()
        .text('Прогноз на 3 дня 📊').text('Прогноз на 7 дней 🔮').row()
        .text('Изменить город 🌇');
    //Если в сообщении нет текста, то сообщаем об ошибке.
    const city = ctx.message.text;
    const chatId = ctx.chat.id;
    if (!city) {
        yield ctx.reply('Ошибка! Я умею читать только названия городов. Пришли, пожалуйста, свой город.');
        return;
    }
    //Проверяем город, для этого отправляем тестовый запрос к апи погоды.
    const checkedCity = yield (0, requests_1.checkCity)(city);
    if (checkedCity === constants_1.API_RESULT.INCORRECT_CITY) {
        yield ctx.reply('Я не нашел такой город. Пожалуйста, введи название существующего населенного пункта.');
        return;
    }
    //Ищем пользователя в БД
    const checkUserInDB = yield (0, db_1.foundUserByChatId)(chatId);
    //Если пользователь есть и у него уже записан город, то сообщаем об этом.
    if (checkUserInDB[0].city !== undefined) {
        yield ctx.reply(`У тебя установлен город ${checkUserInDB[0].city}. Нужно изменить? Нажми соответствующую кнопку.`, { reply_markup: startKeyboard });
        return;
    }
    //Если нет пользователя с таким chatId, то запишем
    if (checkUserInDB === constants_1.DB_RESULT.NOT_FOUND) {
        yield (0, db_1.addUserInDB)(chatId, checkedCity);
    }
    //Сообщаем, что всё ок и теперь будет приходить ежедневный прогноз. Рассказываем о возможностях бота
    yield ctx.reply('Принято ✅ \nТеперь ежедневно буду отправлять прогноз погоды.😊\nМожно запрашивать прогноз вручную на сегодня, завтра 3 и 7 дней, для этого нажимай соответствующие кнопки.\n', { reply_markup: startKeyboard });
    return;
}));
bot.start();
