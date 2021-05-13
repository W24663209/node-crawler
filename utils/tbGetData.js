var webdriver = require('selenium-webdriver');
const {Builder, By, Key} = webdriver

var chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;

(async function start() {
    var options = new chrome.Options();
    // options.headless()
    // options.addArguments('-no-sandbox')               //解决DevToolsActivePort文件不存在的报错
    // options.addArguments('window-size=1920x3000')      //设置浏览器分辨率
    // options.addArguments('-disable-gpu')              //谷歌文档提到需要加上这个属性来规避bug
    // options.addArguments('-hide-scrollbars')          // 隐藏滚动条，应对一些特殊页面
    // options.addArguments('blink-settings=imagesEnabled=false')      // 不加载图片，提升运行速度
    // options.addArguments('-headless')                  // 浏览器不提供可视化界面。Linux下如果系统不支持可视化不加这条会启动失败
    var service = new chrome.ServiceBuilder(path).build();
    chrome.setDefaultService(service);
    var driver = new webdriver.Builder().setChromeOptions(options)
        .withCapabilities(webdriver.Capabilities.chrome()).build();
    await driver.get('https://login.taobao.com/member/login.jhtml?style=mini&newMini2=true&from=alimama&redirectURL=http%3A%2F%2Flogin.taobao.com%2Fmember%2Ftaobaoke%2Flogin.htm%3Fis_login%3d1&full_redirect=true&disableQuickLogin=true');
    await driver.findElement(By.id('fm-login-id')).sendKeys('15086183703');
    await driver.findElement(By.id('fm-login-password')).sendKeys('666666WW', Key.ENTER);
    let currentUrl = await driver.getCurrentUrl();
    while (true) {
        currentUrl = await driver.getCurrentUrl();
        console.log(currentUrl)
        if (currentUrl == 'https://www.alimama.com/index.htm') {
            break
        }
        driver.sleep(200);
    }
    await getData(driver)
})();

async function getData(driver) {
    await driver.executeScript('window.location.href="https://pub.alimama.com/fourth/effect/account/total/index.htm"')
    await driver.executeScript('window.location.href="https://pub.alimama.com/manage/effect/rebate_order.htm?jumpType=0&positionIndex=&pageNo=1&startTime=2020-09-1&endTime=2020-12-11"')
    let cookies = await driver.manage().getCookies();
    console.log(JSON.stringify(cookies))
    // console.log(driver.getPageSource().then(function (e) {
    //     console.log(e)
    // }))
}

//写入文件
function writeFile(path, data, type) {
    if (type && type == 'a') {
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

//解析xpath
function xpathHtml(xpathParams, content, fun) {
    // 构造dom
    let doc = new dom().parseFromString(content, 'text/xml');
    let titles = xpath.select(xpathParams, doc);
    return fun(titles)
}
