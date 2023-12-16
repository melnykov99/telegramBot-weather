"use strict";
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
/*cron.schedule('31 10 * * *', async () => {
    const data = await usersRepository.getAllUsers()
    console.log('Начало кроны')
    if (data === DB_RESULT.UNKNOWN_ERROR) {
        console.log('ошибка бд')
        return
    }
    const usersCount = data.rowCount
    console.log(usersCount)
    const usersData = data.rows
    const togetherDate = new Date().toISOString().split('T')[0]
    if(!usersCount) {
        console.log('ошибка, нет пользователей')
        return
    }
    console.log('крона. Лог перед циклом')
    for (let i = 0; i < usersCount; i++) {
        const chatId = usersData[i].chatId
        console.log('крона в цикле')
        console.log(usersData[i])
        const answer: string = await weatherService.forecastByDate(chatId, togetherDate)
        console.log(answer)
        await bot.api.sendMessage(usersData[i].chatId, answer, {parse_mode: "HTML", reply_markup: mainKeyboard})
        console.log('крона в конце цикла после отправки сообщения')
    }
}, {timezone: 'Europe/Moscow'})
*/
//контекст
async function changeCity(conversation, ctx) {
    var _a, _b;
    await ctx.reply('Пожалуйста, напиши название города в чат');
    const newCityContext = await conversation.wait();
    const city = (_a = newCityContext.update.message) === null || _a === void 0 ? void 0 : _a.text;
    if (!city) {
        await ctx.reply('Ошибка! Я умею определять только текст. <b>Ещё раз нажми кнопку</b> "Изменить город 🌇" и пришли название города.', {
            parse_mode: "HTML",
            reply_markup: mainKeyboard
        });
        return;
    }
    const checkedCity = await apiRequestClient_1.apiRequestClient.checkCity(city);
    if (checkedCity === constants_1.API_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(`Ошибка! Я не смог найти такой город. Проверь название, затем<b>ещё раз нажми кнопку</b> "Изменить город 🌇".`, {
            parse_mode: "HTML",
            reply_markup: mainKeyboard
        });
        return;
    }
    const chatId = (_b = newCityContext.chat) === null || _b === void 0 ? void 0 : _b.id;
    const updateResult = await db_1.usersRepository.updateCityByChatId(chatId, checkedCity);
    if (updateResult === constants_1.DB_RESULT.UNKNOWN_ERROR) {
        await ctx.reply('Ошибка при обновлении города! Попробуйте позже.');
        return;
    }
    await ctx.reply(`Принято ✅\nЗаписали <b>${checkedCity}</b> как твой новый город.`, {
        parse_mode: "HTML",
        reply_markup: mainKeyboard
    });
}
bot.use((0, conversations_1.createConversation)(changeCity));
//Реакция на команду /start. Просим пользователя написать свой город
bot.command("start", async (ctx) => {
    await ctx.reply("Напиши в сообщении свой <b>город</b>❗️  \nЯ буду ежедневно в 0️⃣7️⃣:3️⃣0️⃣ отправлять прогноз погоды. ", { parse_mode: "HTML" });
});
bot.hears("Погода сегодня 🌞", async (ctx) => {
    const togetherDate = new Date().toISOString().split('T')[0];
    const answer = await weatherService_1.weatherService.forecastByDate(ctx.chat.id, togetherDate);
    await ctx.reply(answer, { parse_mode: "HTML", reply_markup: mainKeyboard });
});
bot.hears("Погода завтра 🌅", async (ctx) => {
    const currentDate = new Date();
    const tomorrowDate = currentDate.setDate(currentDate.getDate() + 1);
    const tomorrowDateISO = currentDate.toISOString();
    const answer = await weatherService_1.weatherService.forecastByDate(ctx.chat.id, tomorrowDateISO.split('T')[0]);
    await ctx.reply(answer, { parse_mode: "HTML", reply_markup: mainKeyboard });
});
bot.hears("Прогноз на 3 дня 📊", async (ctx) => {
    const answer = await weatherService_1.weatherService.forecastThreeDays(ctx.chat.id);
    await ctx.reply(answer, { parse_mode: "HTML", reply_markup: mainKeyboard });
});
bot.hears('Прогноз на 5 дней 🔮', async (ctx) => {
    const answer = await weatherService_1.weatherService.forecastFiveDays(ctx.chat.id);
    await ctx.reply(answer, { parse_mode: "HTML", reply_markup: mainKeyboard });
});
bot.hears("Изменить город 🌇", async (ctx) => {
    await ctx.conversation.enter("changeCity");
});
//Реакция на произвольное сообщение
//Произвольное взаимодейтсвие с ботом должно быть только вначале, когда пользователь пишет свой город
bot.on("message", async (ctx) => {
    //Если в сообщении нет текста, то сообщаем об ошибке.
    const city = ctx.message.text;
    const chatId = ctx.chat.id;
    if (!city) {
        await ctx.reply('Ошибка! Я умею определять только текст. Пожалуйста, напиши сообщение с названием своего города');
        return;
    }
    //Ищем пользователя в БД
    const checkUserInDB = await db_1.usersRepository.foundUserByChatId(chatId);
    //Если пользователь добавлен в БД, то писать он нам не должен. Нужно на кнопки нажимать.
    if (checkUserInDB[0].city) {
        await ctx.reply(`У тебя установлен город ${checkUserInDB[0].city}. Нужно изменить? Нажми соответствующую кнопку.`, { reply_markup: mainKeyboard });
        return;
    }
    //Проверяем город, для этого отправляем тестовый запрос к апи погоды.
    const checkedCity = await apiRequestClient_1.apiRequestClient.checkCity(city);
    if (checkedCity === constants_1.API_RESULT.UNKNOWN_ERROR) {
        await ctx.reply('Ошибка! Я не смог найти такой город. Проверь название или попробуй написать позже.');
        return;
    }
    //Добавляем пользователя и его город в БД
    await db_1.usersRepository.addUser(chatId, checkedCity);
    //Сообщаем, что всё ок и теперь будет приходить ежедневный прогноз. Рассказываем о возможностях бота
    await ctx.reply('Принято ✅ \nТеперь ежедневно буду отправлять прогноз погоды.😊\nМожно запрашивать прогноз вручную на сегодня, завтра 3 и 7 дней, для этого нажимай соответствующие кнопки.\n', { reply_markup: mainKeyboard });
    return;
});
exports.default = (0, grammy_1.webhookCallback)(bot, "http");
