import { axiosApi } from "../config/axios.js";

export const deleteUser = async (userId) => {
    try {
        await axiosApi.delete(`/api/users/${userId}`);
        console.log(`Пользователь с ID ${userId} удален`);
    } catch (err) {
        console.error(`Ошибка при удалении пользователя с ID ${userId}`, err);
    }
};