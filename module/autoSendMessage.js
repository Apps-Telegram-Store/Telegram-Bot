import { axiosApi } from "../config/axios.js"
import { deleteUser } from "./deleteUser.js";

export const autoSendMessage = async (bot, message) => {
    try {
        const response = await axiosApi.get("/api/users");
        const users = response.data;

        for (const user of users) {
            if (user.telegramId) {
                try {
                    await bot.sendMessage(user.telegramId, message);
                } catch (err) {
                    if (err.response && err.response.body && err.response.body.error_code === 403) {
                        console.log(`Пользователь ${user.username} заблокировал бота. Удаляем пользователя...`);
                        await deleteUser(user.id);
                    } else {
                        console.error(`Ошибка при отправке сообщения пользователю ${user.username}`, err);
                    }
                }
            }
        }
        console.log("Рассылка завершена");
    } catch (err) {
        console.error("Ошибка рассылки", err);
    }
};