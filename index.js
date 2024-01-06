const TelegramBot = require('node-telegram-bot-api');
const express = require("express");
const cors = require("cors")

const token = "6592811958:AAFuTlebZhk8D1udZQQXfIsAPciFEIsyyBI"



const bot = new TelegramBot(token, {polling: true})
const app = express();

app.use(express.json());
app.use(cors());


    bot.setMyCommands([
        {command: '/start', description: "Ifooderga xush kelibsiz"},
        {command: '/foods', description: "Barcha taomlarni ko'rish"},

    ])

    bot.on("message", async msg =>{
        const chatId = msg.chat.id;
        const text = msg.text


        if(text ==="/start"){
            await bot.sendMessage(chatId, "Menyudagi taomlarni buyurishingiz mumkin",
            {
                reply_markup:{
                    keyboard:[
                        [
                          {
                            text: "Taomlarni ko'rishga bosing!",
                            web_app:{
                                url: 'https://ifooder.onrender.com'
                            }
                          } 
                        ]
                    ]
                }
            })
        }

        if(text === "/foods"){
            await bot.sendMessage(chatId, "Menyudagi taomlarni buyurishingiz mumkin",
            {
                reply_markup:{
                    inline_keyboard: [[{text:"Taomlarni ko'rish", web_app:{url:'https://ifooder.onrender.com'}}]]
                }
            }
            )
        }

        if(msg.web_app_data?.data){
            try{
                const data = JSON.parse(msg.web_app_data?.data)

                await bot.sendMessage(chatId, "Bizga ishonch bildirganingiz uchun rahmat, siz sotib olgan taomlar ro'yxati")

                for(item of data){
                    await bot.sendPhoto(chatId,  item.Image)
                    await bot.sendMessage(chatId, `${item.title} - ${item.quantity}x`)
                }
                await bot.sendMessage(chatId, 
                    `Umumiy narx -${data.reduce(
                        (a,c)=> a + c.price * c.quantity, 0)
                        .toLocaleString('en-US',
                        {style:'currency',
                        currency:'USD',})
                    }` )
            }catch(error){
                console.log(error)

            }
        }
    })




app.post('/web_data',async(req,res)=>{
    const {queryId, products} = req.body

    try{
        await bot.answerWebAppQuery(queryId,{
            type: 'article',
            id:queryId,
            title: 'Muvaffaqiyatli xarid qildingiz',
            input_message_content:{
                message_text: `Xaridingiz bilan tabriklayman, siz ${products.reduce(
                    (a,c)=> a + c.price * c.quantity, 0)
                    .toLocaleString('en-US',
                    {style:'currency',
                    currency:'USD',})} qiymatga ega taomlar sotib oldingiz, ${products.map(
                        c => `${c.title} ${c.quantity}x`
                    ).join(', ')}`,
            },

        });
        return res.status(200).json({});
    }catch(error){
        return res.status(500).json({});
    }


});

app.listen(process.env.PORT || 3500, ()=> 
console.log('Server running')
)