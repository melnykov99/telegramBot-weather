import {Bot, Keyboard} from "grammy";
import dotenv from 'dotenv';
import {currentWeather} from "./requests";
dotenv.config();

const tgBotToken: string | undefined = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Bot(tgBotToken!);
bot.command("start", (ctx) => ctx.reply("Напишите в сообщении город, чтобы получить погоду.", {parse_mode: "HTML"}))

bot.on("message", async (ctx) => {
    const startKeyboard = new Keyboard()
        .text('Погода сегодня 🌞').text('Погода завтра 🌅').row()
        .text('Прогноз на 3 дня 📊').text('Прогноз на 7 дней 🔮').row()
        .text('Изменить город');

    const city: string | undefined = ctx.message.text;
    if (!city) {
        await ctx.reply('Ошибка! Пожалуйста, напишите ваш город повторно')
        return
    }
        const answer: string = await currentWeather(city)
        await ctx.reply(answer, {reply_markup: startKeyboard, parse_mode: "HTML"},);
});


bot.start();