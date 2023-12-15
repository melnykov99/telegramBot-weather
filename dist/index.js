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
const conversations_1 = require("@grammyjs/conversations");
const dotenv_1 = __importDefault(require("dotenv"));
const apiRequestClient_1 = require("./apiRequestClient");
const constants_1 = require("./constants");
const db_1 = require("./db");
const weatherService_1 = require("./weatherService");
const node_cron_1 = __importDefault(require("node-cron"));
dotenv_1.default.config();
const tgBotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new grammy_1.Bot(tgBotToken);
bot.use((0, grammy_1.session)({ initial: () => ({}) }));
bot.use((0, conversations_1.conversations)());
//клавиатура с кнопками, будем выводить при ответе
const mainKeyboard = new grammy_1.Keyboard()
    .text('Погода сегодня 🌞').text('Погода завтра 🌅').row()
    .text('Прогноз на 3 дня 📊').text('Прогноз на 5 дней 🔮').row()
    .text('Изменить город 🌇');
//крона. из БД достаем всех юзеров. Отправляем всем сообщение с их погодой.
node_cron_1.default.schedule('00 6 * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield db_1.usersRepository.getAllUsers();
    if (data === constants_1.DB_RESULT.UNKNOWN_ERROR) {
        return;
    }
    const usersCount = data.rowCount;
    const usersData = data.rows;
    const togetherDate = new Date().toISOString().split('T')[0];
    if (!usersCount) {
        return;
    }
    for (let i = 0; i < usersCount; i++) {
        const chatId = usersData[i].chatId;
        const answer = yield weatherService_1.weatherService.forecastByDate(chatId, togetherDate);
        yield bot.api.sendMessage(usersData[i].chatId, answer, { parse_mode: "HTML", reply_markup: mainKeyboard });
    }
}));
//контекст
function changeCity(conversation, ctx) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.reply('Пожалуйста, напиши название города в чат');
        const newCityContext = yield conversation.wait();
        const city = (_a = newCityContext.update.message) === null || _a === void 0 ? void 0 : _a.text;
        if (!city) {
            yield ctx.reply('Ошибка! Я умею определять только текст. <b>Ещё раз нажми кнопку</b> "Изменить город 🌇" и пришли название города.', {
                parse_mode: "HTML",
                reply_markup: mainKeyboard
            });
            return;
        }
        const checkedCity = yield apiRequestClient_1.apiRequestClient.checkCity(city);
        if (checkedCity === constants_1.API_RESULT.UNKNOWN_ERROR) {
            yield ctx.reply(`Ошибка! Я не смог найти такой город. Проверь название, затем<b>ещё раз нажми кнопку</b> "Изменить город 🌇".`, {
                parse_mode: "HTML",
                reply_markup: mainKeyboard
            });
            return;
        }
        const chatId = (_b = newCityContext.chat) === null || _b === void 0 ? void 0 : _b.id;
        const updateResult = yield db_1.usersRepository.updateCityByChatId(chatId, checkedCity);
        if (updateResult === constants_1.DB_RESULT.UNKNOWN_ERROR) {
            yield ctx.reply('Ошибка при обновлении города! Попробуйте позже.');
            return;
        }
        yield ctx.reply(`Принято ✅\nЗаписали <b>${checkedCity}</b> как твой новый город.`, {
            parse_mode: "HTML",
            reply_markup: mainKeyboard
        });
    });
}
bot.use((0, conversations_1.createConversation)(changeCity));
//Реакция на команду /start. Просим пользователя написать свой город
bot.command("start", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply("Напиши в сообщении свой <b>город</b>❗️  \nЯ буду ежедневно в 0️⃣6️⃣:0️⃣0️⃣ отправлять прогноз погоды. ", { parse_mode: "HTML" });
}));
bot.hears("Погода сегодня 🌞", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const togetherDate = new Date().toISOString().split('T')[0];
    const answer = yield weatherService_1.weatherService.forecastByDate(ctx.chat.id, togetherDate);
    yield ctx.reply(answer, { parse_mode: "HTML", reply_markup: mainKeyboard });
}));
bot.hears("Погода завтра 🌅", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const currentDate = new Date();
    const tomorrowDate = currentDate.setDate(currentDate.getDate() + 1);
    const tomorrowDateISO = currentDate.toISOString();
    const answer = yield weatherService_1.weatherService.forecastByDate(ctx.chat.id, tomorrowDateISO.split('T')[0]);
    yield ctx.reply(answer, { parse_mode: "HTML", reply_markup: mainKeyboard });
}));
bot.hears("Прогноз на 3 дня 📊", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const answer = yield weatherService_1.weatherService.forecastThreeDays(ctx.chat.id);
    yield ctx.reply(answer, { parse_mode: "HTML", reply_markup: mainKeyboard });
}));
bot.hears('Прогноз на 5 дней 🔮', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const answer = yield weatherService_1.weatherService.forecastFiveDays(ctx.chat.id);
    yield ctx.reply(answer, { parse_mode: "HTML", reply_markup: mainKeyboard });
}));
bot.hears("Изменить город 🌇", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.conversation.enter("changeCity");
}));
//Реакция на произвольное сообщение
//Произвольное взаимодейтсвие с ботом должно быть только вначале, когда пользователь пишет свой город
bot.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    //Если в сообщении нет текста, то сообщаем об ошибке.
    const city = ctx.message.text;
    const chatId = ctx.chat.id;
    if (!city) {
        yield ctx.reply('Ошибка! Я умею определять только текст. Пожалуйста, напиши сообщение с названием своего города');
        return;
    }
    //Ищем пользователя в БД
    const checkUserInDB = yield db_1.usersRepository.foundUserByChatId(chatId);
    //Если пользователь добавлен в БД, то писать он нам не должен. Нужно на кнопки нажимать.
    if (checkUserInDB[0].city) {
        yield ctx.reply(`У тебя установлен город ${checkUserInDB[0].city}. Нужно изменить? Нажми соответствующую кнопку.`, { reply_markup: mainKeyboard });
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
    yield ctx.reply('Принято ✅ \nТеперь ежедневно буду отправлять прогноз погоды.😊\nМожно запрашивать прогноз вручную на сегодня, завтра 3 и 7 дней, для этого нажимай соответствующие кнопки.\n', { reply_markup: mainKeyboard });
    return;
}));
bot.start();
