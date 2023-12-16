import {usersRepository} from "./db";

export async function testCron() {
    console.log('крона начало')
    const data = usersRepository.foundCityByUserChatId(283517479)
    console.log('data')

}