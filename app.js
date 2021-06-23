var express = require('express');
const request = require('request');
const TARGET_URL = 'https://api.line.me/v2/bot/message/reply'
const fs = require('fs');
const path = require('path');
const HTTPS = require('https');
const sslport = 23023;
const MULTI_TARGET_URL = 'https://api.line.me/v2/bot/message/multicast'
const BROAD_TARGET_URL = 'https://api.line.me/v2/bot/message/broadcast'

const info = require('./info.js');

var spring = 0
var summer = 0
var fall = 0
var winter = 0

var warm = 0
var cool = 0

var warm_index = 0
var cool_index = 0
var skinIndex = 0

var i = 0
var j = -9

var QuestionCount = 9
var QuestionIndex
    = 0
var count = 16
var WarmOrCool = [warm, cool];
var season_color = [spring, summer, fall, winter]

var Questions = [
    '나의 피부색은 (1)노란기 (2)붉은기가 돈다.',
    '나의 머리색은 (1)갈색 (2)검정색에 가깝다.',
    '나의 혈관색은 (1)초록색 (2)푸른색에 가깝다. ',
    '나의 눈동자 색깔은 (1)밝은 갈색 (2)짙은 갈색이다. ',
    '나의 두피는 (1)노란색을 (2)푸른색을 띤다.',
    '나는 (1)골드 (2)실버 쥬얼리가 더 잘 어울린다. ',
    '나는 (1)아이보리 (2)새하얀 화이트가 더 잘 어울린다.',
    '나는 (1)브라운/카키 (2)핑크/블루 계열의 옷이 더 잘어울린다.',
    '햇빛에 노출되었을 경우 (1)갈색으로 탄다 (2)붉게 그을린다.',
]

var warm_files = [
    'https://personal-color-chatbot.s3.amazonaws.com/warm_carmel.png',
    'https://personal-color-chatbot.s3.amazonaws.com/warm_coral.png',
    'https://personal-color-chatbot.s3.amazonaws.com/warm_green.png',
    'https://personal-color-chatbot.s3.amazonaws.com/warm_mint.png',
    'https://personal-color-chatbot.s3.amazonaws.com/warm_purple.png',
    'https://personal-color-chatbot.s3.amazonaws.com/warm_softgreen.png',
    'https://personal-color-chatbot.s3.amazonaws.com/warm_yellow.jpg',
]

var cool_files = [
    'https://personal-color-chatbot.s3.amazonaws.com/cool_blue.png',
    'https://personal-color-chatbot.s3.amazonaws.com/cool_lightpink.png',
    'https://personal-color-chatbot.s3.amazonaws.com/cool_lightpurple.png',
    'https://personal-color-chatbot.s3.amazonaws.com/cool_mint.png',
    'https://personal-color-chatbot.s3.amazonaws.com/cool_navy.png',
    'https://personal-color-chatbot.s3.amazonaws.com/cool_pink.png',
    'https://personal-color-chatbot.s3.amazonaws.com/cool_yellow.png',
]


const bodyParser = require('body-parser');
var app = express();

request.post(
    {
        url: BROAD_TARGET_URL,
        headers: {
            'Authorization': `Bearer ${info.TOKEN}`
        },
        json: {
            "messages": [
                {
                    "type": "text",
                    "text": "STEP1: 제시된 질문에 대하여 자신에게 더 맞는 선택지를 고르세요 [1/2]"
                },
                {
                    "type": "text",
                    "text": "STEP2: 제시된 이미지를 자신의 피부 위에 두고 자신에게 더 어울리는 색깔을 고르세요 [1/2]"
                },
                {
                    "type": "text",
                    "text": "퍼스널 컬러 진단 테스트를 시작하려면 'start'를 입력하세요 "
                }
            ]
        }
    }, (error, response, body) => {
        console.log(body)
    });



app.use(bodyParser.json());


app.post('/hook', function (req, res) {
    var eventObj = req.body.events[0];
    var source = eventObj.source;
    var message = eventObj.message;

    TestSkinType(eventObj.replyToken, eventObj.message.text)
    Color_Test(eventObj.replyToken, eventObj.message.text)

    if (YourSkinTypeIs(warm, cool) == 0) Get_warmColor(eventObj.replyToken, eventObj.message.text);
    else if (YourSkinTypeIs(warm, cool) == 1) Get_coolColor(eventObj.replyToken, eventObj.message.text);

    res.sendStatus(200);
});


function TestSkinType(replyToken, message) {
    if (message == "start") {
        request.post(
            {
                url: TARGET_URL,
                headers: {
                    'Authorization': `Bearer ${info.TOKEN}`
                },
                json: {
                    "replyToken": replyToken,
                    "messages": [
                        {
                            "type": "text",
                            "text": Questions[0],
                        },
                    ],
                }
            }, (error, response, body) => {
                console.log(body)
            });
    }
}


function Color_Test(replyToken, message) {
    if (message == "1" || message == "2" || message == "3" || message == "4") {
        if (message == "1" || message == "2") {
            request.post(
                {
                    url: TARGET_URL,
                    headers: {
                        'Authorization': `Bearer ${info.TOKEN}`
                    },
                    json: {
                        "replyToken": replyToken,
                        "messages": [
                            {
                                "type": "text",
                                "text": Questions[i],

                            },
                        ],
                    }
                }, (error, response, body) => {
                    console.log(body)
                });


        }
        if (QuestionCount <= 0) {
            if (YourSkinTypeIs(warm, cool) == 0) {
                request.post(
                    {
                        url: TARGET_URL,
                        headers: {
                            'Authorization': `Bearer ${info.TOKEN}`
                        },
                        json: {
                            "replyToken": replyToken,
                            "messages": [
                                {
                                    "type": "image",
                                    "originalContentUrl": warm_files[j],
                                    "previewImageUrl": warm_files[j],
                                },
                            ],
                        }
                    }, (error, response, body) => {
                        console.log(body)
                    });
            }
            else if (YourSkinTypeIs(warm, cool) == 1) {
                request.post(
                    {
                        url: TARGET_URL,
                        headers: {
                            'Authorization': `Bearer ${info.TOKEN}`
                        },
                        json: {
                            "replyToken": replyToken,
                            "messages": [
                                {
                                    "type": "image",
                                    "originalContentUrl": cool_files[j],
                                    "previewImageUrl": cool_files[j],
                                },
                            ],
                        }
                    }, (error, response, body) => {
                        console.log(body)
                    });
            }

        }


    }
    if (count == 0) {
        request.post(
            {
                url: TARGET_URL,
                headers: {
                    'Authorization': `Bearer ${info.TOKEN}`
                },
                json: {
                    "replyToken": replyToken,
                    "messages": [
                        {
                            "type": "text",
                            "text": "테스트가 완료되었습니다. 결과를 확인하시겠습니까? [Y/N] "
                        },
                    ],
                }
            }, (error, response, body) => {
                console.log(body)
            });
    }
    if (message == "1") {
        warm += 1
    }
    else if (message == "2") {
        cool += 1
    }
    if (QuestionCount < 0) {
        if (message == '1' && YourSkinTypeIs(warm, cool) == 0) spring += 1
        else if (message == '2' && YourSkinTypeIs(warm, cool) == 0) fall += 1
        else if (message == '1' && YourSkinTypeIs(warm, cool) == 1) summer += 1
        else if (message == '2' && YourSkinTypeIs(warm, cool) == 1) winter += 1
    }

    i += 1
    j += 1
    QuestionCount -= 1;
    count -= 1

    YourSkinTypeIs(warm, cool);

    if (YourSkinTypeIs(warm, cool) == 0) {
        YourWarmColorIs(spring, fall);
    }
    else YourCoolColorIs(summer, winter);
}

function YourSkinTypeIs(warm, cool) {
    var WarmOrCool = [warm, cool];
    if (warm > cool) {
        skinIndex = 0;
    }
    else skinIndex = 1;

    return skinIndex;
}



function YourWarmColorIs(spring, fall) {
    if (spring > fall) warm_index = 0
    else warm_index = 1

    return warm_index;
}

function YourCoolColorIs(summer, winter) {
    if (summer > winter) cool_index = 3
    else cool_index = 4
    return cool_index;
}


function Get_warmColor(replyToken, message) {
    if (message == "Y") {
        if (YourWarmColorIs(spring, fall) == 0) {
            request.post(
                {
                    url: TARGET_URL,
                    headers: {
                        'Authorization': `Bearer ${info.TOKEN}`
                    },
                    json: {
                        "replyToken": replyToken,
                        "messages": [
                            {
                                "type": "image",
                                "originalContentUrl": 'https://personal-color-chatbot.s3.amazonaws.com/warm_spring.png',
                                "previewImageUrl": 'https://personal-color-chatbot.s3.amazonaws.com/warm_spring.png',
                            },
                            {
                                "type": "text",
                                "text": "당신의 퍼스널 컬러는 '봄 웜'입니다.\nBEST: 명도가 높고 채도가 낮은 색상 \nWORST: 전체적으로 흰 빛과 푸른 빛이 감도는 색상, 또는 무채색"
                            }
                        ],
                    }
                }, (error, response, body) => {
                    console.log(body)
                });
        }
        if (YourWarmColorIs(spring, fall) == 1) {
            request.post(
                {
                    url: TARGET_URL,
                    headers: {
                        'Authorization': `Bearer ${info.TOKEN}`
                    },
                    json: {
                        "replyToken": replyToken,
                        "messages": [
                            {
                                "type": "image",
                                "originalContentUrl": 'https://personal-color-chatbot.s3.amazonaws.com/warm_fall.png',
                                "previewImageUrl": 'https://personal-color-chatbot.s3.amazonaws.com/warm_fall.png',
                            },
                            {
                                "type": "text",
                                "text": "당신의 퍼스널 컬러는 '가을 웜'입니다.\nBEST: 명도와 채도가 낮고 탁한톤의 색상, 노랑과 검정이 섞여있는 색상 \nWORST: 찬 계열의 색상과 파스텔톤"
                            },

                        ],
                    }
                }, (error, response, body) => {
                    console.log(body)
                });
        }
    }
}

function Get_coolColor(replyToken, message) {
    if (message == "Y") {
        if (YourCoolColorIs(summer, winter) == 3) {
            request.post(
                {
                    url: TARGET_URL,
                    headers: {
                        'Authorization': `Bearer ${info.TOKEN}`
                    },
                    json: {
                        "replyToken": replyToken,
                        "messages": [
                            {
                                "type": "image",
                                "originalContentUrl": 'https://personal-color-chatbot.s3.amazonaws.com/cool_summer.png',
                                "previewImageUrl": 'https://personal-color-chatbot.s3.amazonaws.com/cool_summer.png',
                            },
                            {
                                "type": "text",
                                "text": "당신의 퍼스널 컬러는 '여름 쿨'입니다.\nBEST: 명도는 높고 채도는 낮은 톤, 흰색과 파랑 톤의 기운이 느껴지는 색상\nWORST: 검은색과 너무 어두운색, 금속성의 반사적인 색, 노란기미가 있는 색"
                            },

                        ],
                    }
                }, (error, response, body) => {
                    console.log(body)
                });
        }
        if (YourCoolColorIs(summer, winter) == 4) {
            request.post(
                {
                    url: TARGET_URL,
                    headers: {
                        'Authorization': `Bearer ${info.TOKEN}`
                    },
                    json: {
                        "replyToken": replyToken,
                        "messages": [
                            {
                                "type": "image",
                                "originalContentUrl": 'https://personal-color-chatbot.s3.amazonaws.com/cool_winter.png',
                                "previewImageUrl": 'https://personal-color-chatbot.s3.amazonaws.com/cool_winter.png',
                            },
                            {
                                "type": "text",
                                "text": "당신의 퍼스널 컬러는 '겨울 쿨'입니다.\nBEST: 명도와 채도가 높은 톤, 푸르면서 흰색이 기본 색상\nWORST: 황금색 계열"

                            },
                        ],
                    }
                }, (error, response, body) => {
                    console.log(body)
                });
        }
    }
}


try {
    const option = {
        ca: fs.readFileSync('/etc/letsencrypt/live/' + info.domain + '/fullchain.pem'),
        key: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + info.domain + '/privkey.pem'), 'utf8').toString(),
        cert: fs.readFileSync(path.resolve(process.cwd(), '/etc/letsencrypt/live/' + info.domain + '/cert.pem'), 'utf8').toString(),
    };
    HTTPS.createServer(option, app).listen(sslport, () => {
        console.log(`[HTTPS] Server is started on port ${sslport}`);
    });
} catch (error) {
    console.log('[HTTPS] HTTPS 오류가 발생하였습니다. HTTPS 서버는 실행되지 않습니다.');
    console.log(error);
}