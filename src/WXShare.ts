import site = require('Site');
import weixin = require('services/WeiXin');
import info = require('services/Info');
import app = require('Application');
import wx = require('jweixin');
import shopping = require('services/Shopping');



class WXShareArguments { //= function () {
    private _imgUrl: string;
    private _link: string;
    private _description: string;
    private _title: string;
    private _page: chitu.Page;

    constructor(page: chitu.Page) {
        this._page = page;
    }

    imgUrl(value: string = undefined) {
        if (value === undefined) {
            if (!this._imgUrl) {
                var src = $(document.body).find('img:visible').first().attr('src') || '';
                if (src.substr(0, 5).toLowerCase() != 'http:') {
                    src = "http://" + location.host + '/' + src;
                }

                this._imgUrl = src;
            }

            return this._imgUrl;
        }

        this._imgUrl = value;
    }
    link(value: string = undefined) {
        if (value === undefined) {
            return this._link;
        }

        this._link = value;
    }
    description(value: string = undefined) {
        if (value === undefined) {
            if (!this._description)
                this._description = $(this._page.element).children('div:visible').first().text().trim().substr(0, 40) + '...';
            // this._description = $('.container :visible').text().trim().substr(0, 40) + '...';

            return this._description;
        }

        this._description = value;
    }
    title(value: string = undefined) {
        if (value === undefined) {
            if (!this._title)
                this._title = site.config.storeName;

            return this._title;
        }

        this._title = value;
    }
};

// 说明：新版分享，适用于 6.0.2 及以上版本（包括6.0.2）

var wx_ready = $.Deferred();
var args_changed = $.Deferred();

var now = new Date();
var config = {
    //debug: true,
    //appId: site.config.weixin.appid,
    timestamp: new Date().getTime(),
    nonceStr: 'shoutao',
    jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage']
};

var url = location.href.split('#')[0];

weixin.jsSignature(config.nonceStr, url).done(function (obj) {
    $.extend(config, obj);
    wx.config(config);
    wx.ready(function () {
        wx_ready.resolve();
    });
    wx.error(function (res) {
        if (res.errMsg.indexOf('invalid signature') > 0) {
            //ready();
        };
    });
});

var wx_is_ready = false;
function ensureWXReady(callback: Function): JQueryPromise<any> {
    if (wx_is_ready)
        return callback();

    return wx_ready.done(() => callback());
}

function SetShareInfo(args: WXShareArguments) {

    wx.onMenuShareTimeline({
        title: args.title(), // 分享标题
        link: args.link(), // 分享链接
        imgUrl: args.imgUrl(), // 分享图标
        success: function () {
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    })

    wx.onMenuShareAppMessage({
        title: args.title(), // 分享标题
        desc: args.description(), // 分享描述
        link: args.link(), // 分享链接
        imgUrl: args.imgUrl(), // 分享图标
        //type: '', // 分享类型,music、video或link，不填默认为link
        //dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
        success: function () {
            // 用户确认分享后执行的回调函数
        },
        cancel: function () {
            // 用户取消分享后执行的回调函数
        }
    });
}


function createWxShareArguments(page: chitu.Page): WXShareArguments {


    var args = new WXShareArguments(page);

    //==========================================
    // 延迟：一定要延时，否则执行chitu框架中，Application.back 方法时，分享路径会不对。
    // 产生原因：先显示页面，再更改浏览器路径
    //window.setTimeout(function () {

    var link = args.link();
    if (!link)
        link = location.href;

    //var openidExists = false;
    //var arr = link.split('/');
    //var last = arr[arr.length - 1] || '';
    //if (last.indexOf('o1Ux1u') == 0 || last.indexOf('o4mqUj') == 0) {
    //    openidExists = true;
    //}

    //var url = link;
    //if (openidExists == false) {
    //    url = url + '_' + weixin.openid();
    //}

    args.link(url);
    //alert(args.link());
    //result.resolve(args);

    //}, 1000);
    //==========================================


    return args;
}

function page_shown(sender: chitu.Page) {
    var args = sender.routeData.values;
    var pageName = sender.name.toLowerCase();
    //var wx_args = createWxShareArguments();
    var wx_args: WXShareArguments = createWxShareArguments(sender);
    //.done(function (wx_args: WXShareArguments) {
    var deferred: JQueryPromise<any> = $.Deferred().resolve();
    switch (pageName) {
        case 'home.index':
            var description = "感谢您关注零食有约。";
            wx_args.description(description);
            wx_args.imgUrl("http://u.alinq.cn/test//logo_144.png");
            wx_args.title(site.config.storeName);
            ensureWXReady(() => SetShareInfo(wx_args));
            break;
        case 'home.news':
            var news_id = args.id;
            deferred = info.getArticleById(news_id).done(function (news) {
                var imageUrl = ko.unwrap(news.ImgUrl);
                if (imageUrl.indexOf('http') < 0) {
                    imageUrl = 'http://' + site.config.imageBaseUrl + imageUrl;
                }

                wx_args.link(site.config.baseUrl + '#Home_News_' + news_id)// + '/' + weixin.openid());
                wx_args.description($('<div>').html(news.Content).text().trim().substr(0, 40) + '...');
                wx_args.imgUrl(imageUrl);
                wx_args.title(news.Title);
                ensureWXReady(() => SetShareInfo(wx_args));
            });
            break;
        case 'home.newslist':
            /// <param name="args" type="wxShareArguments"/>
            wx_args.title('微资讯');
            wx_args.description('微资讯');
            ensureWXReady(() => SetShareInfo(wx_args));
            //wx_args.link(site.config.baseUrl + '#Home/NewsList');
            break;
        case 'home.product':
            var product_id = args.id;
            deferred = shopping.getProduct(product_id).done(function (product) {
                var imageUrl = ko.unwrap(product.ImageUrl);
                if (imageUrl.indexOf('http') < 0) {
                    imageUrl = site.config.imageBaseUrl + imageUrl;
                }

                var description = $('<div>').html(ko.unwrap(product.Introduce)).text().trim().substr(0, 40) + '...';
                wx_args.link(site.config.baseUrl + '#Home_Product_' + product_id + '_');// + weixin.openid());
                wx_args.description(description);
                wx_args.imgUrl(imageUrl);
                wx_args.title(ko.unwrap(product.Name));
                ensureWXReady(() => SetShareInfo(wx_args));
            });
            break;
        case 'home.productlist':
            wx_args.title(site.config.storeName || '商品中心');
            ensureWXReady(() => SetShareInfo(wx_args));
            break;
        default:
            break;
        case 'home.class':
            wx_args.title('商品中心');
            wx_args.description('商品中心');
            ensureWXReady(() => SetShareInfo(wx_args));
            break;
        //case 'activity.events':
        //    wx_args.title('关注免费领取118元必米诺');
        //    wx_args.description('人体70%的免疫细胞来自肠道，让肠道健康专家：来自英国的全球益生元领导品牌“必米诺”，给你免费清清肠。');
        //    wx_args.imgUrl('http://www.lanfans.com/imagesbak/events_tb.jpg');
        //    break;
        //case 'home.brand':
        //    deferred = services.shopping.getBrand(args.id).done(function (brand) {
        //        wx_args.title(brand.Name);
        //        wx_args.description($('<div>').html(ko.unwrap(brand.Introduce)).text().trim().substr(0, 40) + '...');
        //    });
        //    break;

    }


}


app.pageCreated.add(function (sender: chitu.Application, page: chitu.Page) {
    /// <param name="page" type="chitu.Page"/>

    // page.showing.add(function (sender: chitu.Page, args) {
    //     if ($.inArray(sender.name.toLowerCase(), ['home.news', 'home.product']) < 0) {
    //         document.title = site.config.storeName;
    //     }
    // });

    // page.container.shown.add(page_shown);
    page.load.add(page_shown);
});


