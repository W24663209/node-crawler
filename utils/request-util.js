let asyncRequest = require('./AsyncRequest.js')
let UserAgent = require('user-agents')
let request = require('request')
var http = require('http')
let util = require('util');
let path = require('path')

// 代理服务器ip和端口,由快代理提供
let proxy_ip = '127.0.0.1';
let proxy_port = 15732;
// 完整代理服务器url
let proxy = util.format('http://%s:%d', proxy_ip, proxy_port);
// let proxy;

let fs = require('fs')
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

//发送同步请求
async function requestMethod(url, params) {
    asyncRequest.sleep(parseInt(Math.random() * 10))
    var req = {'url': url}
    if (proxy) {
        req['proxy'] = proxy
    }
    if (params && params['body']) {
        req['body'] = params['body']
    }
    const userAgent = new UserAgent({deviceCategory: 'desktop'});//生成桌面级user-agent
    req['headers'] = {
        'User-Agent': userAgent.data.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Connection': 'keep-alive'
    }
    // req['headers'] = {
    //     'User-Agent': user_agent[Math.floor((Math.random() * user_agent.length))],
    // 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    // 'Cookie': '_ga=GA1.2.269029677.1604158342; __cfduid=d18ac4dc424ff01f78f9e9378d4f7b4931607102785; _gid=GA1.2.777726980.1607853409; m5a4xojbcp2nx3gptmm633qal3gzmadn=anniversarytoothbrush.com',
    // }

    console.log('请求数据:' + JSON.stringify(req))
    return await asyncRequest.syncBody(req)
}


//写入文件
function writeFile(path, data, type) {
    if (type && 'a' == (type)) {
        fs.appendFileSync(path, data, function (error) {
            if (error) {
                console.log('写入失败')
            } else {
                console.log('写入成功了')
            }
        })
    } else {
        fs.writeFile(path, data, function (error) {
            if (error) {
                console.log('写入失败')
            } else {
                console.log('写入成功了')
            }
        })
    }
}

//读取文件
function readFile(path) {
    return fs.readFileSync(path, 'utf-8');
}

//解析xpath
function xpathHtml(xpathParams, content) {
    // 构造dom
    let doc = typeof content == 'string' ? new dom().parseFromString(content, 'text/xml') : content;
    if (xpathParams && doc) {
        return xpath.select(xpathParams, doc)
    }
}


//下载图片
function saveImage(remote, local) {
    const mkdir = (absLocal) => {
        if (fs.existsSync(absLocal)) {
            return true;
        } else {
            if (mkdir(path.dirname(absLocal))) {
                fs.mkdirSync(absLocal, 0o777);
                return true;
            }
        }
    }
    return new Promise(resolve => {
        let root = path.join(path.dirname(process.cwd()), local);
        mkdir(path.dirname(root));
        asyncRequest.sleep(parseInt(Math.random() * 10) * 50)
        downImg(remote, local, resolve)
    })
}

function downImg(remote, local, resolve) {
    request({url: remote, 'proxy': proxy, encoding: 'binary'}, (err, response, body) => {
        fs.writeFileSync(local, body, {encoding: 'binary'});
        if (!body || body.length == 0) {
            downImg(remote, local, resolve)
        }
        console.log('下载图片成功\t下载地址:' + remote + '\t保存路径:' + local)
        resolve();
    })
}


//创建目录
function mkdirSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
    return false
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

module.exports = {requestMethod, writeFile, xpathHtml, mkdirSync, saveImage, sleep, readFile}
