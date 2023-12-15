import {Bot, Context, Keyboard, session, webhookCallback} from "grammy";
import {type Conversation, type ConversationFlavor, conversations, createConversation,} from "@grammyjs/conversations";
import dotenv from 'dotenv';
import {apiRequestClient} from "./apiRequestClient";
import {API_RESULT, DB_RESULT} from "./constants";
import {usersRepository} from "./db";
import {weatherService} from "./weatherService";
import cron from 'node-cron'

type WeatherContext = Context & ConversationFlavor;
type WeatherConversation = Conversation<WeatherContext>;

dotenv.config();

const tgBotToken: string | undefined = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Bot<WeatherContext>(tgBotToken!);

bot.use(session({initial: () => ({})}));
bot.use(conversations());

//клавиатура с кнопками, будем выводить при ответе
const mainKeyboard = new Keyboard()
    .text('Погода сегодня 🌞').text('Погода завтра 🌅').row()
    .text('Прогноз на 3 дня 📊').text('Прогноз на 5 дней 🔮').row()
    .text('Изменить город 🌇');

//крона. из БД достаем всех юзеров. Отправляем всем сообщение с их погодой.
cron.schedule('00 6 * * *', async () => {
    const data = await usersRepository.getAllUsers()
    if (data === DB_RESULT.UNKNOWN_ERROR) {
        return
    }
    const usersCount = data.rowCount
    const usersData = data.rows
    const togetherDate = new Date().toISOString().split('T')[0]
    if(!usersCount) {
        return
    }
    for (let i = 0; i < usersCount; i++) {
        const chatId = usersData[i].chatId
        const answer: string = await weatherService.forecastByDate(chatId, togetherDate)
        await bot.api.sendMessage(usersData[i].chatId, answer, {parse_mode: "HTML", reply_markup: mainKeyboard})
    }
})

//контекст
async function changeCity(conversation: WeatherConversation, ctx: WeatherContext) {
    await ctx.reply('Пожалуйста, напиши название города в чат')
    const newCityContext = await conversation.wait()
    const city = newCityContext.update.message?.text
    if (!city) {
        await ctx.reply('Ошибка! Я умею определять только текст. <b>Ещё раз нажми кнопку</b> "Изменить город 🌇" и пришли название города.', {
            parse_mode: "HTML",
            reply_markup: mainKeyboard
        })
        return
    }
    const checkedCity: string = await apiRequestClient.checkCity(city)
    if (checkedCity === API_RESULT.UNKNOWN_ERROR) {
        await ctx.reply(`Ошибка! Я не смог найти такой город. Проверь название, затем<b>ещё раз нажми кнопку</b> "Изменить город 🌇".`, {
            parse_mode: "HTML",
            reply_markup: mainKeyboard
        })
        return
    }
    const chatId = newCityContext.chat?.id
    const updateResult = await usersRepository.updateCityByChatId(chatId!, checkedCity)
    if (updateResult === DB_RESULT.UNKNOWN_ERROR) {
        await ctx.reply('Ошибка при обновлении города! Попробуйте позже.')
        return
    }
    await ctx.reply(`Принято ✅\nЗаписали <b>${checkedCity}</b> как твой новый город.`, {
        parse_mode: "HTML",
        reply_markup: mainKeyboard
    })
}

bot.use(createConversation(changeCity));

//Реакция на команду /start. Просим пользователя написать свой город
bot.command("start", async (ctx) => {
    await ctx.reply("Напиши в сообщении свой <b>город</b>❗️  \nЯ буду ежедневно в 0️⃣6️⃣:0️⃣0️⃣ отправлять прогноз погоды. ", {parse_mode: "HTML"})
})
bot.hears("Погода сегодня 🌞", async (ctx) => {
    const togetherDate = new Date().toISOString().split('T')[0]
    const answer: string = await weatherService.forecastByDate(ctx.chat.id, togetherDate)
    await ctx.reply(answer, {parse_mode: "HTML", reply_markup: mainKeyboard})
})
bot.hears("Погода завтра 🌅", async (ctx) => {
    const currentDate = new Date();
    const tomorrowDate = currentDate.setDate(currentDate.getDate() + 1);
    const tomorrowDateISO = currentDate.toISOString();
    const answer: string = await weatherService.forecastByDate(ctx.chat.id, tomorrowDateISO.split('T')[0])
    await ctx.reply(answer, {parse_mode: "HTML", reply_markup: mainKeyboard})
})
bot.hears("Прогноз на 3 дня 📊", async (ctx) => {
    const answer = await weatherService.forecastThreeDays(ctx.chat.id)
    await ctx.reply(answer, {parse_mode: "HTML", reply_markup: mainKeyboard})
})
bot.hears('Прогноз на 5 дней 🔮', async (ctx) => {
    const answer = await weatherService.forecastFiveDays(ctx.chat.id)
    await ctx.reply(answer, {parse_mode: "HTML", reply_markup: mainKeyboard})
})
bot.hears("Изменить город 🌇", async (ctx) => {
    await ctx.conversation.enter("changeCity")
})

//Реакция на произвольное сообщение
//Произвольное взаимодейтсвие с ботом должно быть только вначале, когда пользователь пишет свой город
bot.on("message", async (ctx) => {

    //Если в сообщении нет текста, то сообщаем об ошибке.
    const city: string | undefined = ctx.message.text;
    const chatId: number = ctx.chat.id
    if (!city) {
        await ctx.reply('Ошибка! Я умею определять только текст. Пожалуйста, напиши сообщение с названием своего города')
        return
    }
    //Ищем пользователя в БД
    const checkUserInDB = await usersRepository.foundUserByChatId(chatId)
    //Если пользователь добавлен в БД, то писать он нам не должен. Нужно на кнопки нажимать.
    if (checkUserInDB[0].city) {
        await ctx.reply(`У тебя установлен город ${checkUserInDB[0].city}. Нужно изменить? Нажми соответствующую кнопку.`, {reply_markup: mainKeyboard})
        return
    }
    //Проверяем город, для этого отправляем тестовый запрос к апи погоды.
    const checkedCity: string = await apiRequestClient.checkCity(city)
    if (checkedCity === API_RESULT.UNKNOWN_ERROR) {
        await ctx.reply('Ошибка! Я не смог найти такой город. Проверь название или попробуй написать позже.')
        return
    }
    //Добавляем пользователя и его город в БД
    await usersRepository.addUser(chatId, checkedCity)
    //Сообщаем, что всё ок и теперь будет приходить ежедневный прогноз. Рассказываем о возможностях бота
    await ctx.reply('Принято ✅ \nТеперь ежедневно буду отправлять прогноз погоды.😊\nМожно запрашивать прогноз вручную на сегодня, завтра 3 и 7 дней, для этого нажимай соответствующие кнопки.\n', {reply_markup: mainKeyboard})
    return
});

export default webhookCallback(bot, "http");
