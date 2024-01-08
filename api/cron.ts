import {NowRequest, NowResponse} from "@vercel/node";
import {usersRepository} from "./usersRepository";
import {weatherService} from "./weatherService";
import {bot, mainKeyboard} from "./bot";
import {DB_RESULT} from "./constants";

/*
Cronjob for sending daily weather forecast
Get all users from the database and try to send a message to each
 */
async function forecastEverydayCron() {
    const data = await usersRepository.getAllUsers();
    if (data === DB_RESULT.UNKNOWN_ERROR) {
        return console.log("cron error. db error");
    }
    const usersCount: number | null = data.rowCount;
    if (!usersCount) {
        return console.log("cron error. data.rowCount null");
    }
    const usersData = data.rows;
    for (let i = 0; i < usersCount; i++) {
        const chatId = usersData[i].chatId;
        const answer: string = await weatherService.forecastRequest(chatId, 'today');
        try {
            await bot.api.sendMessage(usersData[i].chatId, answer, {parse_mode: "HTML", reply_markup: mainKeyboard});
        } catch (error) {
            console.log(error);
        }
    }
    console.log("cron successfully completed");
}

//Default export for calling cronjob
export default async (req: NowRequest, res: NowResponse) => {
    try {
        await forecastEverydayCron();
        res.status(200).send("Cron job completed successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Cron Internal Server Error");
    }
};