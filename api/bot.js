"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainKeyboard = exports.bot = void 0;
const grammy_1 = require("grammy");
const conversations_1 = require("@grammyjs/conversations");
const dotenv_1 = __importDefault(require("dotenv"));
const apiRequestClient_1 = require("./apiRequestClient");
const constants_1 = require("./constants");
const usersRepository_1 = require("./usersRepository");
const weatherService_1 = require("./weatherService");
//Uploads variables .env for further using
dotenv_1.default.config();
//Creating a bot. Use a special Telegram token. The bot is created with the previously declared context.
const tgBotToken = process.env.TELEGRAM_BOT_TOKEN;
exports.bot = new grammy_1.Bot(tgBotToken);
//For the correct operation of conversation it is necessary to initialize the session.
exports.bot.use((0, grammy_1.session)({ initial: () => ({}) }));
exports.bot.use((0, conversations_1.conversations)());
//Keyboard with buttons that are displayed on outgoing message
exports.mainKeyboard = new grammy_1.Keyboard()
    .text("Погода сегодня 🌞").text("Погода завтра 🌅").row()
    .text("Прогноз на 3 дня 📊").text("Прогноз на 5 дней 🔮").row()
    .text("Изменить город 🌇");
/*
Conversation logic on click "Change city 🌇. Here"
We send a message asking to write the name of the city.
If the message is incorrect or the city is not valid, then terminate the function and report an error.
Otherwise, we update the user's city in the database.
 */
async function changeCity(conversation, ctx) {
    var _a;
    await ctx.reply("Пожалуйста, напиши название города в чат");
    const newCityContext = await conversation.wait();
    const city = (_a = newCityContext.update.message) === null || _a === void 0 ? void 0 : _a.text;
    if (!city) {
        await ctx.reply(constants_1.outputMessages.changeCityNoTextMessage, {
            parse_mode: "HTML",
            reply_markup: exports.mainKeyboard
        });
        return;
    }
    const checkedCity = await apiRequestClient_1.apiRequestClient.checkCity(city);
    if (checkedCity === constants_1.API_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(constants_1.outputMessages.changeCityInvalidCity, {
            parse_mode: "HTML",
            reply_markup: exports.mainKeyboard
        });
        return;
    }
    const chatId = newCityContext.chat.id;
    const updateResult = await usersRepository_1.usersRepository.updateCityByChatId(chatId, checkedCity);
    if (updateResult === constants_1.DB_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(constants_1.outputMessages.changeCityUnknownError);
        return;
    }
    await ctx.reply(constants_1.outputMessages.changeCitySuccessfully(checkedCity), {
        parse_mode: "HTML",
        reply_markup: exports.mainKeyboard
    });
}
exports.bot.use((0, conversations_1.createConversation)(changeCity));
//Reaction to /start command. Ask the user to write city. Let him know that we will be sending him the weather every day.
exports.bot.command("start", async (ctx) => {
    await ctx.reply(constants_1.outputMessages.commandStart, { parse_mode: "HTML" });
});
//Below are reactions to click buttons from the keyboard
exports.bot.hears("Погода сегодня 🌞", async (ctx) => {
    const togetherDate = new Date().toISOString().split("T")[0];
    const answer = await weatherService_1.weatherService.forecastByDate(ctx.chat.id, togetherDate);
    await ctx.reply(answer, { parse_mode: "HTML", reply_markup: exports.mainKeyboard });
});
exports.bot.hears("Погода завтра 🌅", async (ctx) => {
    const currentDate = new Date();
    const tomorrowDate = currentDate.setDate(currentDate.getDate() + 1);
    const tomorrowDateISO = currentDate.toISOString();
    const answer = await weatherService_1.weatherService.forecastByDate(ctx.chat.id, tomorrowDateISO.split("T")[0]);
    await ctx.reply(answer, { parse_mode: "HTML", reply_markup: exports.mainKeyboard });
});
exports.bot.hears("Прогноз на 3 дня 📊", async (ctx) => {
    const answer = await weatherService_1.weatherService.forecastThreeDays(ctx.chat.id);
    await ctx.reply(answer, { parse_mode: "HTML", reply_markup: exports.mainKeyboard });
});
exports.bot.hears("Прогноз на 5 дней 🔮", async (ctx) => {
    const answer = await weatherService_1.weatherService.forecastFiveDays(ctx.chat.id);
    await ctx.reply(answer, { parse_mode: "HTML", reply_markup: exports.mainKeyboard });
});
//Starts the conversation changeCity, which was created earlier
exports.bot.hears("Изменить город 🌇", async (ctx) => {
    await ctx.conversation.enter("changeCity");
});
/*
Responding to any messages.
It is assumed that the user writes a message only after the /start command to write his city.
In other cases we will inform him about an error
 */
exports.bot.on("message", async (ctx) => {
    //The bot only accepts text messages.
    const city = ctx.message.text;
    const chatId = ctx.chat.id;
    if (!city) {
        await ctx.reply(constants_1.outputMessages.noTextMessage);
        return;
    }
    //Search user's city in the database
    const checkUsersCity = await usersRepository_1.usersRepository.foundCityByUserChatId(chatId);
    //Database error
    if (checkUsersCity === constants_1.DB_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(constants_1.outputMessages.unknownError);
        return;
    }
    //If a user with a city is already in the database, he should not write. He needs to press the buttons on keyboard.
    if (checkUsersCity !== constants_1.DB_RESULT.NOT_FOUND) {
        await ctx.reply(constants_1.outputMessages.cityAlreadyExist(checkUsersCity), { reply_markup: exports.mainKeyboard });
        return;
    }
    //Check the city by sending a test request to the weather API.
    const checkedCity = await apiRequestClient_1.apiRequestClient.checkCity(city);
    if (checkedCity === constants_1.API_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(constants_1.outputMessages.invalidCity);
        return;
    }
    //Adding user and him city in DB
    await usersRepository_1.usersRepository.addUser(chatId, checkedCity);
    //Inform users that your city accepted. Inform about daily forecasts. Inform about possibilities bot.
    await ctx.reply(constants_1.outputMessages.acceptCity, { reply_markup: exports.mainKeyboard });
    return;
});
//Subscribe to webhooks to work with Vercel
exports.default = (0, grammy_1.webhookCallback)(exports.bot, "http");
