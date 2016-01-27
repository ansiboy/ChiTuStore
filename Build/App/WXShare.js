define(["require", "exports", 'Site', 'Services/WeiXin', 'Services/Info', 'Application', 'jweixin', 'Services/Shopping'], function (require, exports, site, weixin, info, app, wx, shopping) {
    var WXShareArguments = (function () {
        function WXShareArguments(page) {
            this._page = page;
        }
        WXShareArguments.prototype.imgUrl = function (value) {
            if (value === void 0) { value = undefined; }
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
        };
        WXShareArguments.prototype.link = function (value) {
            if (value === void 0) { value = undefined; }
            if (value === undefined) {
                return this._link;
            }
            this._link = value;
        };
        WXShareArguments.prototype.description = function (value) {
            if (value === void 0) { value = undefined; }
            if (value === undefined) {
                if (!this._description)
                    this._description = $(this._page.nodes().content).children('div:visible').first().text().trim().substr(0, 40) + '...';
                return this._description;
            }
            this._description = value;
        };
        WXShareArguments.prototype.title = function (value) {
            if (value === void 0) { value = undefined; }
            if (value === undefined) {
                if (!this._title)
                    this._title = site.config.storeName;
                return this._title;
            }
            this._title = value;
        };
        return WXShareArguments;
    })();
    ;
    var wx_ready = $.Deferred();
    var args_changed = $.Deferred();
    var now = new Date();
    var config = {
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
            }
            ;
        });
    });
    var wx_is_ready = false;
    function ensureWXReady(callback) {
        if (wx_is_ready)
            return callback();
        return wx_ready.done(function () { return callback(); });
    }
    function SetShareInfo(args) {
        wx.onMenuShareTimeline({
            title: args.title(),
            link: args.link(),
            imgUrl: args.imgUrl(),
            success: function () {
            },
            cancel: function () {
            }
        });
        wx.onMenuShareAppMessage({
            title: args.title(),
            desc: args.description(),
            link: args.link(),
            imgUrl: args.imgUrl(),
            success: function () {
            },
            cancel: function () {
            }
        });
    }
    function createWxShareArguments(page) {
        var args = new WXShareArguments(page);
        var link = args.link();
        if (!link)
            link = location.href;
        args.link(url);
        return args;
    }
    function page_shown(sender) {
        var args = sender.routeData.values();
        var pageName = sender.name.toLowerCase();
        var wx_args = createWxShareArguments(sender);
        var deferred = $.Deferred().resolve();
        switch (pageName) {
            case 'home.index':
                var description = "感谢您关注零食有约。";
                wx_args.description(description);
                wx_args.imgUrl("http://u.alinq.cn/test/Images/logo_144.png");
                wx_args.title(site.config.storeName);
                ensureWXReady(function () { return SetShareInfo(wx_args); });
                break;
            case 'home.news':
                var news_id = args.id;
                deferred = info.getArticleById(news_id).done(function (news) {
                    var imageUrl = ko.unwrap(news.ImgUrl);
                    if (imageUrl.indexOf('http') < 0) {
                        imageUrl = 'http://' + site.config.imageBaseUrl + imageUrl;
                    }
                    wx_args.link(site.config.baseUrl + '#Home_News_' + news_id);
                    wx_args.description($('<div>').html(news.Content).text().trim().substr(0, 40) + '...');
                    wx_args.imgUrl(imageUrl);
                    wx_args.title(news.Title);
                    ensureWXReady(function () { return SetShareInfo(wx_args); });
                });
                break;
            case 'home.newslist':
                wx_args.title('微资讯');
                wx_args.description('微资讯');
                ensureWXReady(function () { return SetShareInfo(wx_args); });
                break;
            case 'home.product':
                var product_id = args.id;
                deferred = shopping.getProduct(product_id).done(function (product) {
                    var imageUrl = ko.unwrap(product.ImageUrl);
                    if (imageUrl.indexOf('http') < 0) {
                        imageUrl = site.config.imageBaseUrl + imageUrl;
                    }
                    var description = $('<div>').html(ko.unwrap(product.Introduce)).text().trim().substr(0, 40) + '...';
                    wx_args.link(site.config.baseUrl + '#Home_Product_' + product_id + '_');
                    wx_args.description(description);
                    wx_args.imgUrl(imageUrl);
                    wx_args.title(ko.unwrap(product.Name));
                    ensureWXReady(function () { return SetShareInfo(wx_args); });
                });
                break;
            case 'home.productlist':
                wx_args.title(site.config.storeName || '商品中心');
                ensureWXReady(function () { return SetShareInfo(wx_args); });
                break;
            default:
                break;
            case 'home.class':
                wx_args.title('商品中心');
                wx_args.description('商品中心');
                ensureWXReady(function () { return SetShareInfo(wx_args); });
                break;
        }
    }
    app.pageCreated.add(function (sender, page) {
        /// <param name="page" type="chitu.Page"/>
        page.showing.add(function (sender, args) {
            if ($.inArray(sender.name.toLowerCase(), ['home.news', 'home.product']) < 0) {
                document.title = site.config.storeName;
            }
        });
        page.shown.add(page_shown);
    });
    if (app.currentPage() != null && app.currentPage().visible())
        page_shown(app.currentPage());
});
