const requestSync = require("request")
let UserAgent = require('user-agents')

//定义同步函数
async function synchronous_post(options) {
    return await new Promise(function (resolve, reject) {
        requestSync(options, function (error, response, body) {
            if (response && response.statusCode && response.statusCode == 503) {
                sleep(1000)
                const userAgent = new UserAgent({deviceCategory: 'desktop'});//生成桌面级user-agent
                options['headers'] = {
                    'User-Agent': userAgent.data.userAgent,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Connection': 'keep-alive'
                }
                return synchronous_post(options)
            }
            if (error) {
                console.log(error)
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
}

//获取body
async function syncBody(options) {
    return await synchronous_post(options);
}


//睡眠
function sleep(NumMillis) {
    console.log('等待' + NumMillis / 1000 + '秒')
    var nowTime = new Date();
    var exitTime = nowTime.getTime() + NumMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

exports.syncBody = syncBody;
exports.sleep = sleep;
//
// var body = syncBody('http://www.baidu.com');	//函数外部使用
// console.log(body)
// body.then(r=>{
//     console.log(r)
// })
// funcName('http://www.baidu.com')
// // // 在其他函数内部使用
// async function funcName(url) {
//     var body = await syncBody(url);
//     console.log(body);
// }
