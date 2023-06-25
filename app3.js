import { Configuration, OpenAIApi } from "openai"
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import { Server } from 'socket.io';
import http, { IncomingMessage } from 'http';

const key="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJnZ2ZkYmp4emRyZ2Jic2dqMTY1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7InVzZXJfaWQiOiJ1c2VyLWZsbHpxYWxkZWY3dzB5bFZtY3pNSDFlZiJ9LCJpc3MiOiJodHRwczovL2F1dGgwLm9wZW5haS5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDg2NDE0MDk3NjQ1MTY4OTU5MDkiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLm9wZW5haS5hdXRoMGFwcC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNjg3NTU0NjkzLCJleHAiOjE2ODg3NjQyOTMsImF6cCI6IlRkSkljYmUxNldvVEh0Tjk1bnl5d2g1RTR5T282SXRHIiwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCBtb2RlbC5yZWFkIG1vZGVsLnJlcXVlc3Qgb3JnYW5pemF0aW9uLnJlYWQgb3JnYW5pemF0aW9uLndyaXRlIn0.S8K8CWg5s4h4utLdlDmIeT1V1ZAcNk8OKEn8VaWEl0z9J8P-h-JUFCuLff7IZEJdsA2i1LSd-5IorZlcykBvvd_sR8j21iRIw82rcCAxI0Ksr75s5bzkuMeUV3YIZdvpJT_HI2w9lH6B8lPM81aLoDfEF5wiVl2DBkZJIYxDcRJUDy-ZYa5d8zIoDgyHWWEAyOxkgoFfDnQ0WqIJYKO7LsK8E_g0pu5TDZuPhI7aMvI4dDxOJ7z3SLukjRiyb6GWLQMYGwfCTZWNHw3e02iYicMFl-hSKgzRUbLCHIhfgYqBLG2RFqBBtQGWQoPdfmg-Q9bjUCLQSa3hLbvtWj7lsA"


const configuration = new Configuration({
    apiKey: key
});
const openai = new OpenAIApi(configuration);

const app = express();
const port = 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
});

app.use(bodyParser.json())
app.use(cors())
app.get('/', async (req, res) => {
    // get chatgpt response
    const completion = await openai.createChatCompletion(
        {
            model: 'gpt-3.5-turbo-0613',
            messages: [{role: "user", content: "Напиши сообщение на 3000 символов как я провел лето"}],
            stream: true,
        },
        { responseType: 'stream' }
    );
    // io.emit('chatgptResChunk', { chatID: chatID, content: '.' });
    const stream = completion.data;
    let chatgptResponse = { role: 'assistant', content: '' };
    stream.on('data', (chunk) => {
        const payloads = chunk.toString().split('\n\n');
        for (const payload of payloads) {
            if (payload.includes('[DONE]')) return;
            if (payload.startsWith('data:')) {
                const data = JSON.parse(payload.replace('data: ', ''));
                try {
                    const chunkContent = data.choices[0].delta?.content;
                    if (chunkContent) {
                        chatgptResponse.content += chunkContent;
                        console.log(chatgptResponse.content)
                        io.emit('chatgptResChunk', { content: chatgptResponse.content });
                    }
                } catch (err) {
                    console.log(`Error with JSON.parse and ${payload}.\n${err}`);
                    io.emit('resError', { chatID: chatID, error: err });
                }
            }
        }
    });

    stream.on('end', async () => {
        console.log(chatgptResponse, 'chatgptResponse')
    });

    stream.on('error', (err) => {
        console.log(err);
        io.emit('resError', { chatID: chatID, error: err });
    });
});

app.listen(port, () => {
    console.log('Слушаю на порту:', port)
})
