import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

function mostrarMenu(ctx: any) {
    return ctx.reply(
        'O que você deseja fazer?',
        Markup.inlineKeyboard([
        [Markup.button.callback('🍽️ Buscar por tipo de comida', 'buscar_tipo')],
        [Markup.button.callback('📍 Enviar localização', 'enviar_localizacao')],
        [Markup.button.callback('🏘️ Buscar por bairro', 'buscar_bairro')],
    ])
);
}

const bot = new Telegraf(process.env.BOT_TOKEN!);

// Menu principal
bot.start((ctx) => 
    ctx.reply(
        'Olá! Eu sou seu bot!',
        mostrarMenu(ctx)
    ));

bot.command('menu', (ctx) => {
    mostrarMenu(ctx)
});

// Ação: Buscar por tipo de comida
bot.action('buscar_tipo', (ctx) => {
ctx.answerCbQuery();
ctx.reply(
    'Escolha o tipo de comida:',
    Markup.keyboard([
    ['🍕 Pizza', '🍔 Hamburguer'],
    ['🍣 Sushi', '🥗 Salada'],
    ['❌ Cancelar']
    ])
    .oneTime()
    .resize()
);
});

// Ação: Enviar localização
bot.action('enviar_localizacao', (ctx) => {
ctx.answerCbQuery();
ctx.reply(
    'Clique no botão abaixo para enviar sua localização:',
    Markup.keyboard([
    [Markup.button.locationRequest('📍 Enviar Localização')],
    ['❌ Cancelar']
    ])
    .oneTime()
    .resize()
);
});

// Ação: Buscar por bairro
bot.action('buscar_bairro', (ctx) => {
ctx.answerCbQuery();
ctx.reply(
    'Escolha o bairro:',
    Markup.inlineKeyboard([
    [Markup.button.callback('Centro', 'bairro_Centro')],
    [Markup.button.callback('Zona Sul', 'bairro_ZonaSul')],
    [Markup.button.callback('Bairro Alto', 'bairro_BairroAlto')]
    ])
);
});

// Tratando bairros
bot.action(/bairro_(.+)/, async (ctx) => {
const bairro = ctx.match[1];
ctx.answerCbQuery();
ctx.reply(`🔍 Buscando restaurantes no bairro: ${bairro}...`);
  // Pode chamar a API do Google Maps com a query de texto `${bairro}`
});

// Tratando tipos de comida
bot.hears(['🍕 Pizza', '🍔 Hamburguer', '🍣 Sushi', '🥗 Salada'], async (ctx) => {
const tipo = ctx.message.text.replace(/[^a-zA-Z]/g, '');
ctx.reply(`🔍 Buscando por restaurantes de ${tipo}...`);
  // pode usar a API com parâmetro `keyword: tipo`
});

// Localização enviada
bot.on('location', async (ctx) => {
const { latitude, longitude } = ctx.message.location;

const response = await axios.get(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
    {
    params: {
        key: process.env.GOOGLE_MAPS_API_KEY,
        location: `${latitude},${longitude}`,
        radius: 2000,
        type: 'restaurant',
        opennow: true
    }
}
);

const results = response.data.results.slice(0, 5);

if (results.length === 0) {
    return ctx.reply("Nenhum restaurante aberto encontrado perto de você.");
}

    let message = "🍽️ Restaurantes abertos perto de você:\n\n";
    results.forEach((place: any, index: number) => {
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.vicinity)}`;
    message += `${index + 1}. ${place.name} - ⭐ ${place.rating || 'N/A'}\n📍 ${place.vicinity}\n🔗 [Abrir no Google Maps](${mapsLink})\n\n`;
});

    ctx.replyWithMarkdown(message);
});
bot.hears('❌ Cancelar', (ctx) => {
    ctx.reply('Cancelado!');
    mostrarMenu(ctx);
});

bot.launch();
console.log('Bot rodando...');




















// import {Telegraf} from 'telegraf';
// import express from 'express'
// import dotenv from 'dotenv';
// import axios from 'axios'

// dotenv.config()

// const bot = new Telegraf(process.env.BOT_TOKEN!);

// bot.start((ctx) => ctx.reply('Olá! Bateu a fome??? Mande sua localização que te mostro os restaurantes perto de você!'));
// bot.help((ctx) => ctx.reply('Use /start para iniciar.'));
// bot.command('buscar', (ctx) => {
//     ctx.reply('Toque abaixo para enviar sua localização:', {
//         reply_markup:{
//             keyboard:[[{ text: '📍 Enviar localização', request_location: true }]],
//             one_time_keyboard: true,
//             resize_keyboard: true,
//         }
//     });
// });
// bot.on('location', async (ctx) => {
//     const { latitude, longitude } = ctx.message.location;

//     const response = await axios.get(
//     `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
//     {
//         params: {
//         key: process.env.GOOGLE_MAPS_API_KEY,
//         location: `${latitude},${longitude}`,
//         radius: 2000, // 2km
//         type: 'restaurant',
//         opennow: true
//         }
//     }
//     );

//     const results = response.data.results.slice(0, 5);

//     if (results.length === 0) {
//     return ctx.reply("Nenhum restaurante aberto encontrado perto de você.");
//     }

//     let message = "🍽️ Restaurantes abertos perto de você:\n\n";
//     results.forEach((place:any, index:number) => {
//         const name = place.name;
//         const rating = place.rating || 'N/A';
//         const address = place.vicinity;
//         const lat = place.geometry.location.lat;
//         const lng = place.geometry.location.lng;
//         const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        
//         message += `${index + 1}. ${name} - ⭐ ${rating}\n📍 ${address}\n🔗 [Abrir no Maps](${mapsUrl})\n\n`;
//     });

//     ctx.replyWithMarkdown(message);
// });
// bot.command('buscarbairro', async (ctx) => {
//     const query = ctx.message.text.split(' ').slice(1).join(' ');
//     if (!query) {
//     return ctx.reply('Por favor, use assim: /buscarbairro nome-do-bairro');
//     }

//     try {
//     const geoResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
//         params: {
//         key: process.env.GOOGLE_MAPS_API_KEY,
//         address: query
//     }
// });

//     const location = geoResponse.data.results[0]?.geometry.location;
//     if (!location) {
//         return ctx.reply('Não consegui encontrar esse bairro. 😢');
//     }

//     const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
//         {
//         params: {
//             key: process.env.GOOGLE_MAPS_API_KEY,
//             location: `${location.lat},${location.lng}`,
//             radius: 2000,
//             type: 'restaurant',
//             opennow: true
//         }
//     }
// );

//     const results = response.data.results.slice(0, 5);
//     if (results.length === 0) {
//         return ctx.reply("Nenhum restaurante aberto encontrado nesse bairro.");
//     }

//       let message = `🍽️ Restaurantes abertos em *${query}*:\n\n`;
//     results.forEach((place: any, index: number) => {
//         const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${place.geometry.location.lat},${place.geometry.location.lng}`;
//         message += `${index + 1}. ${place.name} - ⭐ ${place.rating || 'N/A'}\n📍 ${place.vicinity}\n🔗 [Abrir no Maps](${mapsUrl})\n\n`;
//     });

//     ctx.replyWithMarkdown(message);

//     } catch (error) {
//     console.error(error);
//     ctx.reply('Erro ao buscar o bairro. Tente novamente mais tarde.');
//     }
// });


// bot.launch();
// console.log('Bot está rodando...');
