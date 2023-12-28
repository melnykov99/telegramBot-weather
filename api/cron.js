"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const usersRepository_1 = require("./usersRepository");
const weatherService_1 = require("./weatherService");
const bot_1 = require("./bot");
const constants_1 = require("./constants");
/*
Cronjob for sending daily weather forecast
Get all users from the database and try to send a message to each
 */
async function forecastEverydayCron() {
    const data = await usersRepository_1.usersRepository.getAllUsers();
    if (data === constants_1.DB_RESULT.UNKNOWN_ERROR) {
        return console.log("cron error. db error");
    }
    const usersCount = data.rowCount;
    if (!usersCount) {
        return console.log("cron error. data.rowCount null");
    }
    const usersData = data.rows;
    const togetherDate = new Date().toISOString().split("T")[0];
    for (let i = 0; i < usersCount; i++) {
        const chatId = usersData[i].chatId;
        const answer = await weatherService_1.weatherService.forecastByDate(chatId, togetherDate);
        try {
            await bot_1.bot.api.sendMessage(usersData[i].chatId, answer, { parse_mode: "HTML", reply_markup: bot_1.mainKeyboard });
        }
        catch (error) {
            console.log(error);
        }
    }
    console.log("cron successfully completed");
}
//Default export for calling cronjob
exports.default = async (req, res) => {
    try {
        await forecastEverydayCron();
        res.status(200).send("Cron job completed successfully");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Cron Internal Server Error");
    }
};
