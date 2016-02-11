/// <reference path='../Scripts/typings/require.d.ts'/>
/// <reference path='../Scripts/typings/jquery.d.ts'/>
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
            deps: ['jquery', 'crossroads']
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
        bootbox: '../Scripts/bootbox',
        bs: '../Scripts/bootstrap',
        chitu: '../Scripts/chitu',
        content: '../Content',
        crossroads: '../Scripts/crossroads',
        css: '../Scripts/css',
        hammer: '../Scripts/hammer',
        iscroll: '../Scripts/iscroll-lite',
        jquery: '../Scripts/jquery-2.1.0',
        'jquery.cookie': '../Scripts/jquery.cookie',
        'jquery.event.swipe': '../Scripts/jquery.event.swipe',
        'jquery.event.move': '../Scripts/jquery.event.move',
        knockout: '../Scripts/knockout-3.2.0.debug',
        'knockout.validation': '../Scripts/knockout.validation',
        'knockout.mapping': '../Scripts/knockout.mapping',
        'ko.ext': 'Core/ko.ext',
        scr: '../Scripts',
        sv: '../App/Services',
        swiper: '../Scripts/swiper.jquery',
        text: '../Scripts/text',
        mod: '../App/Module',
        move: '../Scripts/move',
        md5: '../Scripts/CryptoJS/md5',
        sc: '../Content',
        jweixin: 'http://res.wx.qq.com/open/js/jweixin-1.0.0'
    }
});
requirejs(['Site', 'Application', 'bootbox', 'ErrorHandler', 'UI/Loading', 'UI/TopBar', 'move'], function (site, app) {
    var weiXinChecked = $.Deferred();
    var ua = navigator.userAgent.toLowerCase();
    window['move'] = arguments[6];
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
        }
        requirejs(['UI/Menu', 'move']);
    });
    if (site.env.isApp) {
        requirejs(['Device']);
    }
});
