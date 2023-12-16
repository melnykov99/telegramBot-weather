import { NowRequest, NowResponse } from '@vercel/node';
import { usersRepository } from "./db";
import { weatherService } from "./weatherService";
import {bot, mainKeyboard} from "./bot";
import {DB_RESULT} from "./constants";

async function forecastEverydayCron() {
    const data = await usersRepository.getAllUsers()
    if (data === DB_RESULT.UNKNOWN_ERROR) {
        return
    }
    const usersCount = data.rowCount
    if(!usersCount) {
        return
    }
    const usersData = data.rows
    const togetherDate = new Date().toISOString().split('T')[0]
    for (let i = 0; i < usersCount; i++) {
        const chatId = usersData[i].chatId
        const answer: string = await weatherService.forecastByDate(chatId, togetherDate)
        await bot.api.sendMessage(usersData[i].chatId, answer, {parse_mode: "HTML", reply_markup: mainKeyboard})
    }
}

async function testCron() {
    const data = await usersRepository.testFound(283517479)
    if (data === DB_RESULT.UNKNOWN_ERROR) {
        return
    }
    if (data === DB_RESULT.NOT_FOUND) {
        return
    }
    const usersCount = data.rowCount
    if(!usersCount) {
        return
    }
    const usersData = data.rows
    const togetherDate = new Date().toISOString().split('T')[0]
    for (let i = 0; i < usersCount; i++) {
        const chatId = usersData[i].chatId
        const answer: string = await weatherService.forecastByDate(chatId, togetherDate)
        await bot.api.sendMessage(usersData[i].chatId, answer, {parse_mode: "HTML", reply_markup: mainKeyboard})
    }
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