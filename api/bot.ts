import {Bot, Context, Keyboard, session, webhookCallback} from "grammy";
import {type Conversation, type ConversationFlavor, conversations, createConversation,} from "@grammyjs/conversations";
import dotenv from "dotenv";
import {apiRequestClient} from "./apiRequestClient";
import {API_RESULT, DB_RESULT, outputMessages} from "./constants";
import {usersRepository} from "./usersRepository";
import {weatherService} from "./weatherService";


// Declaration context and conversation. Used for changeCity. In this method, well in conversation we expect a response from the user.
type WeatherContext = Context & ConversationFlavor;
type WeatherConversation = Conversation<WeatherContext>;

//Uploads variables .env for further using
dotenv.config();

//Creating a bot. Use a special Telegram token. The bot is created with the previously declared context.
const tgBotToken: string | undefined = process.env.TELEGRAM_BOT_TOKEN;
export const bot = new Bot<WeatherContext>(tgBotToken!);
//For the correct operation of conversation it is necessary to initialize the session.
bot.use(session({initial: () => ({})}));
bot.use(conversations());

//Keyboard with buttons that are displayed on outgoing message
export const mainKeyboard = new Keyboard()
    .text("Погода сегодня 🌞").text("Погода завтра 🌅").row()
    .text("Прогноз на 3 дня 📊").text("Прогноз на 5 дней 🔮").row()
    .text("Изменить город 🌇");


/*
Conversation logic on click "Change city 🌇. Here"
We send a message asking to write the name of the city.
If the message is incorrect or the city is not valid, then terminate the function and report an error.
Otherwise, we update the user's city in the database.
 */
async function changeCity(conversation: WeatherConversation, ctx: WeatherContext) {
    await ctx.reply("Пожалуйста, напиши название города в чат");
    const newCityContext: WeatherContext = await conversation.wait();
    const city: string | undefined = newCityContext.update.message?.text;
    if (!city) {
        await ctx.reply(outputMessages.changeCityNoTextMessage, {
            parse_mode: "HTML",
            reply_markup: mainKeyboard
        });
        return;
    }
    const checkedCity: string = await apiRequestClient.checkCity(city);
    if (checkedCity === API_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(outputMessages.changeCityInvalidCity, {
            parse_mode: "HTML",
            reply_markup: mainKeyboard
        });
        return;
    }
    const chatId: number = newCityContext.chat!.id;
    const updateResult: DB_RESULT.UNKNOWN_ERROR | DB_RESULT.SUCCESSFULLY = await usersRepository.updateCityByChatId(chatId!, checkedCity);
    if (updateResult === DB_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(outputMessages.changeCityUnknownError);
        return;
    }
    await ctx.reply(outputMessages.changeCitySuccessfully(checkedCity), {
        parse_mode: "HTML",
        reply_markup: mainKeyboard
    });
}
bot.use(createConversation(changeCity));

//Reaction to /start command. Ask the user to write city. Let him know that we will be sending him the weather every day.
bot.command("start", async (ctx) => {
    await ctx.reply(outputMessages.commandStart, {parse_mode: "HTML"});
});
//Below are reactions to click buttons from the keyboard
bot.hears("Погода сегодня 🌞", async (ctx) => {
    const togetherDate: string = new Date().toISOString().split("T")[0];
    const answer: string = await weatherService.forecastByDate(ctx.chat.id, togetherDate);
    await ctx.reply(answer, {parse_mode: "HTML", reply_markup: mainKeyboard});
});
bot.hears("Погода завтра 🌅", async (ctx) => {
    const currentDate = new Date();
    const tomorrowDate = currentDate.setDate(currentDate.getDate() + 1);
    const tomorrowDateISO = currentDate.toISOString();
    const answer: string = await weatherService.forecastByDate(ctx.chat.id, tomorrowDateISO.split("T")[0]);
    await ctx.reply(answer, {parse_mode: "HTML", reply_markup: mainKeyboard});
});
bot.hears("Прогноз на 3 дня 📊", async (ctx) => {
    const answer = await weatherService.forecastThreeDays(ctx.chat.id);
    await ctx.reply(answer, {parse_mode: "HTML", reply_markup: mainKeyboard});
});
bot.hears("Прогноз на 5 дней 🔮", async (ctx) => {
    const answer = await weatherService.forecastFiveDays(ctx.chat.id);
    await ctx.reply(answer, {parse_mode: "HTML", reply_markup: mainKeyboard});
});
//Starts the conversation changeCity, which was created earlier
bot.hears("Изменить город 🌇", async (ctx) => {
    await ctx.conversation.enter("changeCity");
});

/*
Responding to any messages.
It is assumed that the user writes a message only after the /start command to write his city.
In other cases we will inform him about an error
 */
bot.on("message", async (ctx) => {
    //The bot only accepts text messages.
    const city: string | undefined = ctx.message.text;
    const chatId: number = ctx.chat.id;
    if (!city) {
        await ctx.reply(outputMessages.noTextMessage);
        return;
    }
    //Search user's city in the database
    const checkUsersCity: DB_RESULT.UNKNOWN_ERROR | DB_RESULT.NOT_FOUND | string = await usersRepository.foundCityByUserChatId(chatId);
    //If a user with a city is already in the database, he should not write. He needs to press the buttons on keyboard.
    if (checkUsersCity) {
        await ctx.reply(outputMessages.cityAlreadyExist(checkUsersCity), {reply_markup: mainKeyboard});
        return;
    }
    //Database error
    if (checkUsersCity === DB_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(outputMessages.unknownError);
        return;
    }
    //Check the city by sending a test request to the weather API.
    const checkedCity: string = await apiRequestClient.checkCity(city)
    if (checkedCity === API_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(outputMessages.invalidCity);
        return;
    }
    //Adding user and him city in DB
    await usersRepository.addUser(chatId, checkedCity);
    //Inform users that your city accepted. Inform about daily forecasts. Inform about possibilities bot.
    await ctx.reply(outputMessages.acceptCity, {reply_markup: mainKeyboard});
    return;
});

//Subscribe to webhooks to work with Vercel
export default webhookCallback(bot, "http");
