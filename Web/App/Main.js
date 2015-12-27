

var require_config = {
    urlArgs: "bust=46",
    shim: {
        chitu: {
            deps: ['jquery']
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
        swiper: '../Scripts/swiper.jquery.min',
        move: '../Scripts/move.min',
        md5: '../Scripts/CryptoJS/md5.min',
        content: '../Content',
        sc: '../Content',       // Site CSS 文件夹
        jweixin: 'http://res.wx.qq.com/open/js/jweixin-1.0.0'
    }
};

requirejs.config(require_config);


requirejs(['Application', 'bootbox', 'ErrorHandler', 'ui/Loading'], function () {//, ]
    //site.ready(function () {
    //====================================================
    // 说明：如果是微信环境，则加载微信模块
    var weiXinChecked = $.Deferred();
    var ua = navigator.userAgent.toLowerCase();
    if (site.env.isWeiXin) { //(ua.match(/MicroMessenger/i) == 'micromessenger') {
        requirejs(['sv/WeiXin', 'WXShare'], function () {//, 'WXShare'
            weiXinChecked.resolve();
        });
    }
    else {
        weiXinChecked.resolve();
    }
    //return weiXinChecked;



    weiXinChecked.done(function () {
        //==================================================
        app.run();
        if (!location.hash)
            location.hash = 'Home_Index';
        console.log('Home_Index');
        //==================================================

        require(['ui/ScrollLoad', 'ui/Loading', 'ui/Menu', 'ui/TopBar']);

        //==================================================
        // 非必要的模块（用于增强用户体验），延后加载
        window.setTimeout(function () {
            require(['move'], function (move) {
                window['move'] = move;
            });

            require(['jquery.event.swipe'], function () { });
        }, 2000);
        //==================================================
    })

    //});

});



