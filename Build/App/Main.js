requirejs.config({
    urlArgs: "bust=32",
    shim: {
        chitu: {
            deps: ['jquery'],
            exports: 'chitu'
        },
        bootstrap: {
            deps: ['jquery']
        },
        bootbox: {
            deps: ['bootstrap']
        },
        'ko.val': {
            deps: ['knockout.validation']
        },
        'ko.mapping': {
            deps: ['knockout']
        },
        'ko.ext': {
            deps: ['knockout']
        },
        backtop: {
            deps: ['jquery']
        },
        //swiper: {
        //    deps: ['css!http://cdn.bootcss.com/Swiper/3.0.8/css/swiper.min']
        //},
        'CryptoJS/md5': {
            deps: ['CryptoJS/core']
        },
        //'prequire': {
        //    deps: ['jquery', 'jquery.cookie', 'knockout']
        //},
        //'app/Custom': {
        //    deps: ['prequire'],//说明：'sv/Member' 已经合并到 prequire 文件中去了。
        //},
        //'ui/ScrollLoad': {
        //    deps: ['prequire']
        //},
        //'sv/WeiXin': {
        //    deps: ['prequire']
        //},
    },
    baseUrl: 'Scripts',
    //paths: {
    //    text: 'require.text',
    //    jquery: 'jquery-2.1.0',
    //    'jquery.cookie': 'jquery.cookie',
    //    chitu: 'ChiTu',
    //    knockout: 'knockout-3.2.0.debug',
    //    'ko.ext': 'knockout.extentions',
    //    'ko.val': 'knockout.validation.cn',
    //    'ko.mapping': 'knockout.mapping',
    //    crossroads: 'crossroads',
    //    bootstrap: 'bootstrap.min',
    //    bootbox: 'bootbox.cn',
    //    sv: '../App/Services',
    //    app: '../App',
    //    ui: '../App/UI',
    //    swiper: 'swiper.jquery',
    //    content: '../Content'
    //}
    paths: {
        css: ['http://cdn.bootcss.com/require-css/0.1.8/css.min', 'css'],
        text: ['http://cdn.bootcss.com/require-text/2.0.12/text.min', 'text'],
        jquery: ['http://libs.baidu.com/jquery/2.0.0/jquery.min', 'jquery-2.1.0'],// 
        'jquery.cookie': ['http://cdn.bootcss.com/jquery-cookie/1.4.0/jquery.cookie.min', 'jquery.cookie'],
        unslider: 'unslider',
        chitu: 'ChiTu',
        knockout: ['http://cdn.bootcss.com/knockout/3.3.0/knockout-min', 'knockout-3.2.0.debug'],
        'ko.ext': 'knockout.extentions',
        'ko.val': 'knockout.validation.cn',
        'ko.mapping': ['http://cdn.bootcss.com/knockout.mapping/2.4.1/knockout.mapping.min', 'knockout.mapping'],
        bootstrap: ['http://cdn.bootcss.com/bootstrap/3.3.4/js/bootstrap.min', 'bootstrap.min'],
        sv: '../App/Services',
        app: '../App',
        ui: '../App/UI',
        swiper: ['http://cdn.bootcss.com/Swiper/3.0.8/js/swiper.jquery.min', 'swiper.jquery'],
        content: '../Content',
        //prequire: '../App/Core/prequire',
        'app/Custom': 'http://p.alinq.cn/LSYY/App/WebClient/StoreToken'
    }
});

define(['jquery', 'jquery.cookie', 'ko.ext/knockout.extentions', 'app/Site', 'app/Application'], function () {

    window['ko'] = arguments[2];

    var getSiteConfig = $.ajax('Home/GetSiteConfig');

    //====================================================
    // 说明：如果是微信环境，则加载微信模块
    var weiXinChecked = $.Deferred();
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        requirejs(['sv/WeiXin'], function () {
            weiXinChecked.resolve();
        });
    }
    else {
        weiXinChecked.resolve();
    }
    //====================================================
    $.when(getSiteConfig, weiXinChecked).done(function (data) {
        //==================================================
        // 说明：必须设置好 config 才能执行 app.run
        var config = data[0];
        site.config.cookiePrefix = config.CookiePrefix;
        site.config.serviceUrl = site.cookies.get_value('shopServiceUrl');
        site.config.memberServiceUrl = site.cookies.get_value('memberServiceUrl');
        site.config.weixinServiceUrl = site.cookies.get_value('weixinServiceUrl');
        //==================================================
        app.run();
        //==================================================
    });

    require(['ui/Menu', 'app/ErrorHandler', 'ui/Loading', 'ui/TopBar']);
});

//});


