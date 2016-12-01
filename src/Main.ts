/// <reference path="scripts/typings/hammer.d.ts"/>
/// <reference path="scripts/typings/move.d.ts"/>
/// <reference path="scripts/typings/jquery.d.ts"/>
/// <reference path="scripts/typings/jquery.cookie.d.ts"/>
/// <reference path="scripts/typings/iscroll.d.ts"/>
/// <reference path="scripts/typings/swiper.d.ts"/>

requirejs.config({
    urlArgs: "bust=46",
    shim: {
        'bs/carousel': {
            deps: ['jquery', 'bs/transition']
        },
        'bs/modal': {
            deps: ['jquery']
        },
        bootbox: {
            deps: ['bs/modal']
        },
        chitu: {
            deps: ['jquery', 'crossroads', 'hammer', 'move']
        },
        hammer: {
            exports: 'Hammer'
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
            deps: ['scripts/CryptoJS/core'],
            exports: 'CryptoJS'
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
        bootbox: 'scripts/bootbox',
        bs: 'scripts/bootstrap',
        chitu: 'scripts/chitu',
        content: 'content',
        crossroads: 'scripts/crossroads',
        css: 'scripts/css',
        hammer: 'scripts/hammer',
        iscroll: 'scripts/iscroll-probe',
        jquery: 'scripts/jquery-2.1.0',
        'jquery.cookie': 'scripts/jquery.cookie',
        'jquery.event.swipe': 'scripts/jquery.event.swipe',
        'jquery.event.move': 'scripts/jquery.event.move',
        knockout: 'scripts/knockout-3.2.0.debug',
        'knockout.validation': 'scripts/knockout.validation',
        'knockout.mapping': 'scripts/knockout.mapping',
        'ko.ext': 'core/ko.ext',
        scr: 'scripts',
        sv: 'services',
        swiper: 'scripts/swiper.jquery',
        text: 'scripts/text',
        mod: 'modules',
        move: 'scripts/move',
        md5: 'scripts/CryptoJS/md5',
        sc: 'content',       // Site CSS 文件夹
        UI: 'ui',
        jweixin: 'http://res.wx.qq.com/open/js/jweixin-1.0.0'
    }
});


requirejs(['Site', 'Application', 'bootbox', 'ErrorHandler', 'ui/Loading', 'ui/TopBar', 'move'], function(site, app) {//, ]
    //site.ready(function () {
    //====================================================
    // 说明：如果是微信环境，则加载微信模块
    var weiXinChecked = $.Deferred();
    var ua = navigator.userAgent.toLowerCase();
    //window['move'] = arguments[6];
    // if (site.env.isWeiXin) { 
    //     requirejs(['sv/WeiXin', 'WXShare'], function() {
    //         weiXinChecked.resolve();
    //     });
    // }
    // else {
        weiXinChecked.resolve();
    //}


    weiXinChecked.done(function() {
        //==================================================
        app.run();
        if (!location.hash) {
            location.hash = site.config.defaultUrl;
        }

        //==================================================

        requirejs(['move']);

        //==================================================
        // 非必要的模块（用于增强用户体验），延后加载
        //         window.setTimeout(function() {
        //             requirejs(['move'], function(move) {
        //                 window['move'] = move;
        //             });
        // 
        //             //require(['jquery.event.swipe'], function () { });
        //         }, 2000);
        //==================================================
    })

});



