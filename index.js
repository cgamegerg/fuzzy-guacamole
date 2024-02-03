const express = require('express');
const bodyParser = require('body-parser');
const line = require('@line/bot-sdk');
const axios = require('axios');

// ตั้งค่า LINE API
const config = {
    channelAccessToken: 'mtZ6B6/0A2litTkH8aBcrVDQdDDhgPkkGqxNZezj0VAIqlmgv44VdHfunOaNI1+DMg/D9lUuqUWxv7XbqJfi89PG0Fd7hUc0PvqdL86dJ5OlyEEdBadcUBaBiY4GX+IsSiRhwaz0EqroJ0k0faaVVwdB04t89/1O/w1cDnyilFU=', // แทนที่ด้วย Access Token ของคุณ
    channelSecret: 'b556af7fec7c17593ccd38c4f3be3d9e', // แทนที่ด้วย Channel Secret ของคุณ
};

const app = express();
app.use(bodyParser.json());

const client = new line.Client(config);

app.post('/webhook', (req, res) => {
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const userMessage = event.message.text.toLowerCase();

    if (userMessage.includes("crypto") || userMessage.includes("forex")) {
        const openaiResponse = await sendToOpenAI(userMessage);
        const replyText = openaiResponse.data.choices[0].text;
        return client.replyMessage(event.replyToken, { type: 'text', text: replyText });
    } else {
        return client.replyMessage(event.replyToken, { type: 'text', text: "I can only provide information about cryptocurrency and forex." });
    }
}

async function sendToOpenAI(text) {
    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: text,
            max_tokens: 150,
        }, {
            headers: {
                'Authorization': `Bearer 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` // แทนที่ด้วย API Key ของคุณ
            }
        });
        return response;
    } catch (error) {
        console.error('Error in OpenAI API call:', error);
        return null;
    }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
