import {axiosApi} from "../config/axios.js";

export const createUser = async (username, id) => {
    try {
        await axiosApi.post("api/users/registerUpdate", {
            "telegramId": id,
            "username": username,
            "role": 1
        })
        console.log('Пользователь создан или обновлен!');
    } catch(err) {
        console.error("Ошибка создания или обновления пользователя: ", err.message);
    }
}