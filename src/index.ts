import {Bot} from "grammy";
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();
const tgBotToken: string | undefined = process.env.TELEGRAM_BOT_TOKEN;
const weatherApiKey = process.env.WEATHER_API_KEY;
const host = 'https://api.weatherapi.com/v1';

const bot = new Bot(tgBotToken!);
bot.command("start", (ctx) => ctx.reply("Напишите в сообщении город, чтобы получить погоду."));
bot.on("message", async (ctx) => {
    const city: string | undefined = ctx.message.text

    try {
        const response = await axios.get(`${host}/current.json?key=${weatherApiKey}&q=${city}&lang=ru`)
        console.log(response.data)
        const answer = `Погода в городе ${response.data.location.name} \nТемпература: ${response.data.current.temp_c} \nСостояние: ${response.data.current.condition.text} \nСкорость ветра: ${response.data.current.wind_mph} м/с`
        await ctx.reply(answer)
    } catch (error) {
        console.log(error)
        await ctx.reply('Ошибка при попытке узнать погоду. Проверьте название города или попробуйте позже.')
    }

});

bot.start();