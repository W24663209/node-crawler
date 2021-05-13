let {requestMethod, writeFile, xpathHtml, sleep} = require('../utils/request-util.js');

// let videoList = []
// let host = 'http://51seqing.site/'
// get51seqing('c_11.html')

let item = {}
item['url'] = 'http://51seqing.site/movie_42912.html'
let m3u8 = getM3u8(item);
Promise.all([m3u8]).then(e => {
    console.log(e)
})

//获取m3u8
async function getM3u8(item) {
    try {
        // let sleepTime = parseInt(Math.random() * 300);
        // sleep(sleepTime)
        let videoUrlBody = await requestMethod(item['url'])
        let videoUrlResults = xpathHtml('//source/@src', videoUrlBody)
        if (videoUrlResults && videoUrlResults.length > 0) {
            //获取视频host
            let videoHost = /(http|https):\/\/.*?\//.exec(videoUrlResults[0].value)[0]
            let videoUrlResult = videoUrlResults[0].value
            let result = await requestMethod(videoUrlResult);
            let urls = result.split('\n');
            if (urls.length > 3) {
                return videoHost + urls[2]
            }
        }
    } catch (e) {
        writeFile('../static/error_url.txt', JSON.stringify(item) + ',', 'a')
    }
}

let count = {}
let keys = []

async function get51seqing(url) {
    let body = await requestMethod(host + url);
    let results = await xpathHtml('//div[@class="item"]/div/a[1]', body)
    if (!results || results.length == 0) {
        if (count[url] >= 10) {
            return
        }
        count[url] += 1
        console.log("加载失败,重试第" + count[url] + "次")
        get51seqing(url)
    } else {
        console.log("加载成功")
    }
    for (let i = 0; i < results.length; i++) {
        let result = results[i];
        let item = {}
        let alts = await xpathHtml('img/@alt', result)
        item['name'] = alts.length > 0 ? alts[0].value : undefined
        let src = await xpathHtml('./img/@data-src', result)
        item['src'] = src.length > 0 ? host + src[0].value : undefined
        let videoUrls = await xpathHtml('./@href', result)
        item['url'] = videoUrls.length > 0 ? host + videoUrls[0].value : undefined
        // if (item['url']) {
        //     item['m3u8'] = await getM3u8(item)
        // }
        videoList.push(item)
    }
    if (!(url in keys)) {
        writeFile('../static/51动漫.json', JSON.stringify(videoList))
        keys.push(url)
    }
    let netPageUrls = xpathHtml('//a[text()="下一页"]/@href', body);
    if (netPageUrls.length > 0) {
        get51seqing(netPageUrls[0].value)
    }
    // writeFile('../static/51动漫.json', JSON.stringify(data) + ',', 'a')
}
