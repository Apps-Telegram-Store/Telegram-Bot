import 'dotenv/config';

import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import { createUser } from './module/createUser.js';
import { autoSendMessage } from './module/autoSendMessage.js';

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const keyboard = [
    [
        {
            text: 'Инструкция📚',
            callback_data: 'instruction_click'
        },
        {
            text: 'Telegram канал✈️',
            url: process.env.TELEGRAM_CHANNEL
        }
    ],
    [
        {
            text: 'Открыть приложение📡',
            web_app: {
                url: process.env.URL_APP
            }
        }
    ]
]

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendSticker(chatId, "CAACAgIAAxkBAAM2ZoZ1XnAPiRQbA5VLNXZt2Xx-LYwAAgEBAAJWnb0KIr6fDrjC5jQ1BA");
    await bot.sendMessage(chatId, 
        '<b>Добро пожаловать в магазин приложений Telegram!</b> 😉 \n\nУ нас ты можешь ознакомится с различными внутренними приложениями Telegram. \n\nА так же можешь разместить свое приложение!',
        {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        },
    );
    await createUser(msg.from.username, msg.from.id);
});

bot.onText(/\/sendMessage (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const message = match[1]; // Получаем текст сообщения после команды

    if (!message) {
        bot.sendMessage(chatId, "Пожалуйста, укажите сообщение для рассылки.");
        return;
    }

    bot.sendMessage(chatId, "Начинаем рассылку...");
    await autoSendMessage(bot, message);
    bot.sendMessage(chatId, "Рассылка завершена.");
});

bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;
    if (data === 'instruction_click') {
        const backKeyboard = {
            inline_keyboard: [
                [
                    {
                        text: 'Назад',
                        callback_data: 'back_to_start'
                    }
                ]
            ]
        };

        bot.editMessageText('Вот инструкция: GA', {
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: backKeyboard
        });

    } else if (data === 'back_to_start') {

        bot.editMessageText('Выберите опцию:', {
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    }
    bot.answerCallbackQuery(callbackQuery.id);
});

bot.onText(/\/donate/, async (msg) => {
    const chatId = msg.chat.id;
    const payload = 'unique_payload';
    const providerToken = process.env.PROVIDER_TOKEN;
    const prices = [{ label: 'Digital Good', amount: 1 }]; // сумма в наименьших единицах Stars

    try {
        const response = await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/createInvoiceLink`, {
            title: 'Донат звездами',
            description: 'Донат с помощь Telegram Stars',
            payload: payload,
            provider_token: providerToken,
            currency: 'XTR',
            prices: prices
        });

        const invoiceLink = response.data.result;
        bot.sendMessage(chatId, `Для того что поблагодарить, перейдите по ссылке: <a href="${invoiceLink}">ПОБЛАГОДАРИТЬ</a>`, {
            parse_mode: "HTML"
        });
    } catch (error) {
        console.error('Ошибка создания ссылки на счет:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при создании ссылки на оплату.');
    }
});

bot.on('pre_checkout_query', (query) => {
    bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('successful_payment', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Спасибо большое за ваши донаты!');
});

bot.on('polling_error', (error) => {
    console.log(error);
});