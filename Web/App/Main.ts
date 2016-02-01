
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
        ErrorHandler: {
            //deps: ['Rewrite']
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
        css: '../Scripts/css',
        text: '../Scripts/text',
        crossroads: '../Scripts/crossroads',
        iscroll: '../Scripts/iscroll-lite',
        jquery: '../Scripts/jquery-2.1.0',
        'jquery.cookie': '../Scripts/jquery.cookie',
        'jquery.event.swipe': '../Scripts/jquery.event.swipe',
        'jquery.event.move': '../Scripts/jquery.event.move',
        chitu: '../Scripts/chitu',
        hammer: '../Scripts/hammer',
        knockout: '../Scripts/knockout-3.2.0.debug',
        'ko.ext': 'Core/ko.ext',
        'knockout.validation': '../Scripts/knockout.validation',
        'knockout.mapping': '../Scripts/knockout.mapping',
        sv: '../App/Services',
        bootbox: 'Core/bootbox',
        mod: '../App/Module',
        scr: '../Scripts',
        swiper: '../Scripts/swiper.jquery',
        move: '../Scripts/move',
        md5: '../Scripts/CryptoJS/md5',
        content: '../Content',
        sc: '../Content',       // Site CSS 文件夹
        jweixin: 'http://res.wx.qq.com/open/js/jweixin-1.0.0'
    }
});


requirejs(['Site', 'Application', 'bootbox', 'ErrorHandler', 'UI/Loading'], function(site, app) {//, ]
    //site.ready(function () {
    //====================================================
    // 说明：如果是微信环境，则加载微信模块
    var weiXinChecked = $.Deferred();
    var ua = navigator.userAgent.toLowerCase();
    if (site.env.isWeiXin) { //(ua.match(/MicroMessenger/i) == 'micromessenger') {
        requirejs(['sv/WeiXin', 'WXShare'], function() {
            weiXinChecked.resolve();
        });
    }
    else {
        weiXinChecked.resolve();
    }


    weiXinChecked.done(function() {
        //==================================================
        app.run();
        if (!location.hash) {
            location.hash = 'Home_Index';
            //=====================================
            // 说明：将引导页关闭
            // if (site.env.isApp) {
            //     window.setTimeout(function() {
            //         window['plus'].webview.currentWebview().close();
            //     }, 1000);
            // }
            //=====================================
        }

        //==================================================

        requirejs(['UI/Loading', 'UI/Menu', 'UI/TopBar']);

        //==================================================
        // 非必要的模块（用于增强用户体验），延后加载
        window.setTimeout(function() {
            requirejs(['move'], function(move) {
                window['move'] = move;
            });

            //require(['jquery.event.swipe'], function () { });
        }, 2000);
        //==================================================
    })

    if (site.env.isApp) {
        requirejs(['Device']);
    }
});



