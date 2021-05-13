let {requestMethod, writeFile, xpathHtml, sleep, saveImage, mkdirSync} = require('../utils/request-util.js');

// start('http://www.177pic.info/html/category/cg/cg-cn/page/1/')
let imgList = []
let count = {}
let keys = []

getImg('http://www.177pic.info/html/2020/12/3982219.html')

async function start(url) {
    let result = await requestMethod(url);
    let pictureBoxs = xpathHtml('//div[@class="picture-box"]', result);
    if (!pictureBoxs || pictureBoxs.length == 0) {
        if (count[url] >= 10) {
            return
        }
        count[url] = (count[url] ? count[url] : 0) + 1
        console.log("加载失败,重试第" + count[url] + "次")
        start(url)
    } else {
        console.log("加载成功")
    }
    for (let i = 0; i < pictureBoxs.length; i++) {
        let imgInfo = {}
        let pictureBox = pictureBoxs[i];
        let imgInfoUrls = xpathHtml('.//a/@href', pictureBox)
        imgInfo['url'] = imgInfoUrls.length > 0 ? imgInfoUrls[0].value : undefined
        let imgNames = xpathHtml('.//h2/a/text()', pictureBox)
        imgInfo['imgName'] = imgNames.length > 0 ? imgNames[0].data : undefined
        imgList.push(imgInfo)
    }
    let nextUrls = xpathHtml('//div[@class="nav-links"]/a/@href', result);
    if (keys.indexOf(url) == -1) {
        writeFile('../static/177漫画.json', JSON.stringify(imgList))
        keys.push(url)
    } else {
        return
    }
    if (nextUrls && nextUrls.length > 0) {
        let nextUrl = nextUrls[nextUrls.length - 1].value
        if (nextUrl != (url)) {
            start(nextUrl)
        }
    }
}

async function getImg(url) {
    try {
        let imgContent = await requestMethod(url);
        let imgUrls = xpathHtml('//div[@class="single-content"]/p/img/@data-lazy-src', imgContent);
        let imgNames = xpathHtml('//h1[@class="entry-title"]/text()', imgContent);
        let imgPath;
        if (imgNames && imgNames.length > 0) {
            imgPath = imgNames[0].nodeValue
            mkdirSync('../static/' + imgPath)
        }
        for (let i = 0; i < imgUrls.length; i++) {
            let imgUrl = imgUrls[i].nodeValue;
            let imgNames = imgUrl.split('/');
            let imgName = imgNames[imgNames.length - 1]
            writeFile('../static/' + imgPath + '.txt', imgUrl + '\n', 'a')
            saveImage(imgUrl, '../static/' + imgPath + '/' + imgName)
        }
        let nextPageUrls = xpathHtml('//div[@class="page-links"]//a/@href', imgContent);
        if (nextPageUrls.length > 0) {
            let nextPageUrl = nextPageUrls[nextPageUrls.length - 1].value
            if (nextPageUrl && keys.indexOf(nextPageUrl) == -1) {
                keys.push(url)
                getImg(nextPageUrl)
            }
        }
    } catch (e) {
        getImg(url)
    }
}
