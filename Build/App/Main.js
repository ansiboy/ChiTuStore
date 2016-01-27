requirejs.config({
    urlArgs: "bust=46",
    shim: {
        chitu: {
            deps: ['jquery', 'crossroads']
        },
        bootbox: {
            deps: ['jquery']
        },
        'knockout': {
            exports: 'ko'
        },
        'ko.mapping': {
            deps: ['knockout']
        },
        swiper: {
            deps: ['jquery', 'css!content/swiper']
        },
        wptr: {
            deps: ['hammer']
        },
        'md5': {
            deps: ['../Scripts/CryptoJS/core'],
            exports: 'CryptoJS'
        },
        'Application': {
            deps: ['chitu', 'knockout', 'ko.ext', 'Site']
        },
        'jquery.cookie': {
            deps: ['jquery']
        },
        'jquery.event.swipe': {
            deps: ['jquery.event.move']
        },
        Site: {
            deps: ['jquery.cookie', 'jquery']
        },
        ErrorHandler: {},
        'Module/Home/ProductList': {
            deps: ['ui/ScrollLoad']
        },
        'iscroll': {
            exports: 'IScroll'
        },
        'move': {
            exports: 'move'
        },
        crossroads: {
            exports: 'crossroads'
        }
    },
    paths: {
        css: '../Scripts/css.min',
        text: '../Scripts/text.min',
        crossroads: '../Scripts/crossroads.min',
        iscroll: '../Scripts/iscroll-lite.min',
        jquery: '../Scripts/jquery-2.1.0.min',
        'jquery.cookie': '../Scripts/jquery.cookie.min',
        'jquery.event.swipe': '../Scripts/jquery.event.swipe.min',
        'jquery.event.move': '../Scripts/jquery.event.move.min',
        chitu: '../Scripts/chitu',
        hammer: '../Scripts/hammer.min',
        knockout: '../Scripts/knockout-3.2.0.min',
        'ko.ext': 'Core/ko.ext',
        'knockout.validation': '../Scripts/knockout.validation.min',
        'knockout.mapping': '../Scripts/knockout.mapping.min',
        sv: '../App/Services',
        bootbox: 'Core/bootbox.min',
        ui: 'UI',
        mod: '../App/Module',
        scr: '../Scripts',
        swiper: '../Scripts/swiper.jquery',
        move: '../Scripts/move.min',
        md5: '../Scripts/CryptoJS/md5.min',
        content: '../Content',
        sc: '../Content',
        jweixin: 'http://res.wx.qq.com/open/js/jweixin-1.0.0'
    }
});
requirejs(['Site', 'Application', 'bootbox', 'ErrorHandler', 'ui/Loading'], function (site, app) {
    var weiXinChecked = $.Deferred();
    var ua = navigator.userAgent.toLowerCase();
    if (site.env.isWeiXin) {
        requirejs(['sv/WeiXin', 'WXShare'], function () {
            weiXinChecked.resolve();
        });
    }
    else {
        weiXinChecked.resolve();
    }
    weiXinChecked.done(function () {
        app.run();
        if (!location.hash) {
            location.hash = 'Home_Index';
            if (site.env.isApp) {
                window.setTimeout(function () {
                    window['plus'].webview.currentWebview().close();
                }, 1000);
            }
        }
        requirejs(['ui/ScrollLoad', 'ui/Loading', 'ui/Menu', 'ui/TopBar']);
        window.setTimeout(function () {
            requirejs(['move'], function (move) {
                window['move'] = move;
            });
        }, 2000);
    });
    function plusReady() {
        requirejs(['Device']);
    }
    if (window['plus']) {
        plusReady();
    }
    else {
        document.addEventListener("plusready", plusReady, false);
    }
});
