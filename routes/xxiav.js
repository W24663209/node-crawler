let {requestMethod, writeFile, readFile, xpathHtml, sleep, saveImage, mkdirSync} = require('../utils/request-util.js');

let imgList = []
let count = {}
let keys = []
page = 193

// start('http://www.xxiav.com/html/category/h/page/' + page + '/', page)


async function start(url, page) {
    let result = await requestMethod(url);
    let infoResult = xpathHtml('//h2[@class="grid-title"]/a', result);
    let arr = []
    for (let i = 0; i < infoResult.length; i++) {
        let href = xpathHtml('@href', infoResult[i])[0].nodeValue;
        let title = xpathHtml('text()', infoResult[i])[0].nodeValue;
        // let mp4Info = await requestMethod(href);
        // let mp4Url = xpathHtml('//a[@rel="noopener"]/@href',mp4Info)[0].nodeValue
        console.log(title + ',' + href)
        arr.push(title + ',' + href)
    }
    console.log(arr.join('\n'))
    writeFile('../static/xxiav.txt', arr.join('\n') + '\n', 'a')
    //获取下一页
    let nextPage = xpathHtml('//a[@class="next page-numbers"]/@href', result);
    if (nextPage) {
        page = page + 1;
    }
    if (page > 199) {
        return
    }
    console.log('第' + page + '页')
    sleep(100)
    start('http://www.xxiav.com/html/category/h/page/' + page + '/', page)
}

getMp4Url()

async function getMp4Url() {
    let pageUrls = readFile('../static/newxxiav.txt').split('\n');
    for (let i = 0; i < pageUrls.length; i++) {
        if (!pageUrls[i]) {
            continue
        }
        var patt = /http:\/\/.*/
        let mp4Info = await requestMethod(patt.exec(pageUrls[i])[0]);
        if (!mp4Info) {
            continue
        }
        let mp4Url = xpathHtml('//a[@rel="noopener"]/@href', mp4Info)[0].nodeValue
        writeFile('../static/xxiavMp4.txt', pageUrls[i] + ',' + mp4Url + '\n', 'a')
        delete pageUrls[i]
        writeFile('../static/newxxiav.txt', pageUrls.join('\n'), 'w')
        console.log(mp4Url)
    }
}