export enum DB_RESULT {
    'NOT_FOUND' = 'entity not found in the database',
    'UNKNOWN_ERROR' = 'An unknown error occurred during the request',
    'SUCCESSFULLY' = 'Operation completed successfully'
}
export enum API_RESULT {
    'UNKNOWN_ERROR'= 'Some error occurred during the request'
}

export const outputMessages = {
    unknownError: `Ошибка! Что-то пошло не так. Пожалуйста, попробуй написать позже.`,
    changeCityNoTextMessage: `Ошибка! Я умею определять только текст. <b>Ещё раз нажми кнопку</b> "Изменить город 🌇" и пришли название города.`,
    changeCityInvalidCity: `Ошибка! Я не смог найти такой город. Проверь название, затем<b>ещё раз нажми кнопку</b> "Изменить город 🌇".`,
    changeCityUnknownError: `Ошибка при обновлении города! Попробуйте позже.`,
    changeCitySuccessfully: (city: string) => `Принято ✅\nЗаписали <b>${city}</b> как твой новый город.`,
    commandStart: `Напиши в сообщении свой <b>город</b>❗️  \nЯ буду ежедневно в 0️⃣7️⃣:0️⃣0️⃣ отправлять прогноз погоды.`,
    noTextMessage: `Ошибка! Я умею определять только текст. Пожалуйста, напиши сообщение с названием своего города`,
    cityAlreadyExist: (city: string) => `У тебя установлен город ${city}. Нужно изменить? Нажми соответствующую кнопку.`,
    invalidCity: `Ошибка! Я не смог найти такой город. Проверь название или попробуй написать позже.`,
    acceptCity: `Принято ✅ \nТеперь ежедневно буду отправлять прогноз погоды.😊\nМожно запрашивать прогноз вручную на сегодня, завтра 3 и 7 дней, для этого нажимай соответствующие кнопки.\n`
}