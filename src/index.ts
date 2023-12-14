import {Bot, Keyboard} from "grammy";
import dotenv from 'dotenv';
import {apiRequestClient} from "./apiRequestClient";
import {API_RESULT, DB_RESULT} from "./constants";
import {usersRepository} from "./db";
import {weatherService} from "./weatherService";

dotenv.config();

const tgBotToken: string | undefined = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Bot(tgBotToken!);

//Реакция на команду /start. Просим пользователя написать свой город
bot.command("start", async (ctx) => {
    await ctx.reply("Напиши в сообщении свой <b>город</b>❗️  \nЯ буду ежедневно в 0️⃣6️⃣:3️⃣0️⃣ отправлять прогноз погоды. ", {parse_mode: "HTML"})
})
bot.hears("Погода сегодня 🌞", async (ctx) => {
    const answer: string = await weatherService.forecastTogether(ctx.chat.id)
    await ctx.reply(answer, {parse_mode: "HTML"})
})

//Реакция на произвольное сообщение
//Произвольное взаимодейтсвие с ботом должно быть только вначале, когда пользователь пишет свой город
bot.on("message", async (ctx) => {
    //клавиатура с кнопками, будем выводить при ответе
    const startKeyboard = new Keyboard()
        .text('Погода сегодня 🌞').text('Погода завтра 🌅').row()
        .text('Прогноз 3 дня 📊').text('Прогноз 7 дней 🔮').row()
        .text('Изменить город 🌇');

    //Если в сообщении нет текста, то сообщаем об ошибке.
    const city: string | undefined = ctx.message.text;
    const chatId: number = ctx.chat.id
    if (!city) {
        await ctx.reply('Ошибка! Я умею читать только названия городов. Пришли, пожалуйста, свой город.')
        return
    }
    //Ищем пользователя в БД
    const checkUserInDB = await usersRepository.foundUserByChatId(chatId)
    //Если пользователь добавлен в БД, то писать он нам не должен. Нужно на кнопки нажимать.
    if (checkUserInDB[0].city) {
        await ctx.reply(`У тебя установлен город ${checkUserInDB[0].city}. Нужно изменить? Нажми соответствующую кнопку.`, {reply_markup: startKeyboard})
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
    await ctx.reply('Принято ✅ \nТеперь ежедневно буду отправлять прогноз погоды.😊\nМожно запрашивать прогноз вручную на сегодня, завтра 3 и 7 дней, для этого нажимай соответствующие кнопки.\n', {reply_markup: startKeyboard})
    return
});


bot.start();