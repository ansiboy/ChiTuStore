

var require_config = {
    urlArgs: "bust=45",
    shim: {
        chitu: {
            deps: ['jquery', 'crossroads']
        },
        bootstrap: {
            deps: ['jquery']
        },
        bootbox: {
            deps: ['jquery']
        },
        'ko.val': {
            deps: ['../Scripts/knockout.validation']
        },
        //'knockout.validation': {
        //    deps: ['../Scripts/knockout.validation']
        //},
        'knockout': {
            exports: 'ko'
        },
        'ko.mapping': {
            deps: ['knockout']
        },
        swiper: {
            deps: ['jquery', 'css!content/swiper']//'css!http://cdn.bootcss.com/Swiper/3.0.8/css/swiper.min']
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
            deps: ['jquery.cookie']
        },
        ErrorHandler: {
            deps: ['Rewrite']
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
        css: '../Scripts/css',//['http://cdn.bootcss.com/require-css/0.1.8/css.min', 'css'],
        text: '../Scripts/text',//['http://cdn.bootcss.com/require-text/2.0.12/text.min', 'text'],
        crossroads: '../Scripts/crossroads',
        iscroll: '../Scripts/iscroll-lite',
        jquery: '../Scripts/jquery-2.1.0',//['http://libs.baidu.com/jquery/2.0.0/jquery.min', 'jquery-2.1.0'],// 
        'jquery.cookie': '../Scripts/jquery.cookie',//['http://cdn.bootcss.com/jquery-cookie/1.4.0/jquery.cookie.min', 'jquery.cookie'],
        'jquery.event.swipe': '../Scripts/jquery.event.swipe',
        'jquery.event.move': '../Scripts/jquery.event.move',
        'jquery.ui.widget': '../Scripts/jquery.ui.widget',
        unslider: '../Scripts/unslider',
        wptr: '../Scripts/wptr.1.1',
        chitu: '../Scripts/chitu',
        hammer: '../Scripts/hammer',
        knockout: '../Scripts/knockout-3.2.0.debug',//['http://cdn.bootcss.com/knockout/3.3.0/knockout-min', 'knockout-3.2.0.debug'],
        'ko.ext': 'Core/ko.ext',
        'ko.val': '../Scripts/knockout.validation.cn',
        'knockout.validation': '../Scripts/knockout.validation',
        'knockout.mapping': '../Scripts/knockout.mapping',//['http://cdn.bootcss.com/knockout.mapping/2.4.1/knockout.mapping.min', 'scr/knockout.mapping'],
        bootstrap: '../Scripts/bootstrap.min',//['http://cdn.bootcss.com/bootstrap/3.3.4/js/bootstrap.min', 'bootstrap.min'],
        scrollLoad: 'UI/ScrollLoad',
        sv: '../App/Services',
        //app: '.',
        bootbox: 'Core/bootbox',
        ui: 'UI',
        mod: '../App/Module',
        scr: '../Scripts',
        swiper: ['../Scripts/swiper.jquery', 'http://cdn.bootcss.com/Swiper/3.0.8/js/swiper.jquery.min'],
        move: '../Scripts/move',
        md5: '../Scripts/CryptoJS/md5',
        content: '../Content',
        sc: '../Content',       // Site CSS 文件夹
        'app/Custom': 'http://p.alinq.cn/LSYY/App/WebClient/StoreToken',
        jweixin: 'http://res.wx.qq.com/open/js/jweixin-1.0.0'
    }
};

requirejs.config(require_config);


requirejs(['Application', 'bootbox', 'ErrorHandler', 'Rewrite', 'ui/Loading'], function () {//, 
    //if (site.env.isIOS) {
    //    require(['iscroll']);
    //}

    site.ready(function () {
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

    });

});


