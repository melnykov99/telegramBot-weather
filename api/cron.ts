import { NowRequest, NowResponse } from '@vercel/node';
import { usersRepository } from "./db";
import { weatherService } from "./weatherService";
import { bot } from "./bot";

export async function testCron() {
    console.log('крона начало')
    const data = usersRepository.foundCityByUserChatId(283517479)
    console.log('data')
    const chatId = 283517479;
    const togetherDate = new Date().toISOString().split('T')[0]
    const answer = await weatherService.forecastByDate(chatId, togetherDate)
    await bot.api.sendMessage(chatId, answer)
}

// Экспортируем функцию для обработки HTTP-запросов
export default async (req: NowRequest, res: NowResponse) => {
    try {
        await testCron(); // Вызываем вашу функцию
        res.status(200).send('Cron job completed successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};