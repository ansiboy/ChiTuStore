import site = require('Site');
import menu = require('ui/Menu');
import TopBar = require('ui/TopBar');

var pages = [];
var scroll_top_data_name = 'ScrollTop';

class ScrollArguments {
    scrollTop: number
    scrollHeight: number
    clientHeight: number
}

var RefreshState = {
    init: 'init',
    ready: 'ready',
    doing: 'doing',
    done: 'done'
}

var REFRESH_CRITICAL_HEIGHT = 60;   //刷新临界高度值，大于这个高度则进行刷新

$(document).scroll(function (event) {
    var args = {
        scrollTop: $(document).scrollTop(),
        scrollHeight: document.body.scrollHeight,
        clientHeight: $(window).height()
    };

    app.currentPage().on_scroll(args);

    cur_scroll_args.clientHeight = args.clientHeight;
    cur_scroll_args.scrollHeight = args.scrollHeight;
    cur_scroll_args.scrollTop = args.scrollTop;
    scrollEndCheck(app.currentPage());
});

var cur_scroll_args: ScrollArguments = new ScrollArguments();
var pre_scroll_top: number;
var checking_num: number;
var CHECK_INTERVAL = 300;
function scrollEndCheck(page: chitu.Page) {
    if (checking_num != null) return;
    //======================
    // 锁定，不让滚动期内创建二次，因setInterval有一定的时间。
    checking_num = 0;
    //======================
    checking_num = window.setInterval(() => {
        if (pre_scroll_top == cur_scroll_args.scrollTop) {
            window.clearInterval(checking_num);
            checking_num = null;
            pre_scroll_top = null;

            page['on_scrollEnd'](cur_scroll_args);

            return;
        }
        pre_scroll_top = cur_scroll_args.scrollTop;

    }, CHECK_INTERVAL);
}

import app = require('Application');

chitu['scroll'] = window['DocumentScroll'] = function (page, config) {
    /// <param name="page" type="chitu.Page"/>

    //var config = $.extend({ recordPosition: true }, config || {});
    if ($.inArray(page, pages) >= 0)
        return;

    pages.push(page);

    //=======================================================
    // 属性

    $.extend(page, {
        scrollEnd: chitu.Callbacks(),
        on_scrollEnd: function (args) {
            return chitu.fireCallback(this.scrollEnd, [this, args]);
        },
        scrollTop: function (value) {
            if (value === undefined)
                return $(document.body).scrollTop() || $(document).scrollTop();

            if ($(document.body).scrollTop() != null) {
                $(document.body).scrollTop(value);
            }
            else {
                $(document).scrollTop(value);
            }
        }
    })

    //page.scrollTop = $.proxy(function (value) {
    //    if (value === undefined)
    //        return $(document.body).scrollTop() || $(document).scrollTop();

    //    if ($(document.body).scrollTop() != null) {
    //        $(document.body).scrollTop(value);
    //    }
    //    else {
    //        $(document).scrollTop(value);
    //    }

    //}, page);

    //=======================================================
    // 事件
    if (config.recordPosition) {
        page.shown.add(function (sender) {
            // 说明：显示页面，scrollTop 定位
            sender.scrollTop($(sender.node()).data(scroll_top_data_name) || '0px');
        });

        page.scroll.add(function (sender, args) {
            $(sender.node()).data(scroll_top_data_name, sender.scrollTop());
        });
    }

    var page_shown = function (sender: chitu.Page) {
        /// <param name="sender" type="chitu.Page"/>
        //if (!site.menu)
        //    return;

        var topbar: TopBar = page['topbar'];
        if (topbar) {
            $(sender.nodes().content).css('padding-top', topbar.height() + 'px');
            //$loading.css('top', topbar.height() + 'px');
        }

        if (menu.visible()) {
            sender.nodes().content.style.marginBottom = menu.height() + 'px';
        }
        else {
            sender.nodes().content.style.marginBottom = '0px';
        }

        page.node().style.marginBottom = '0px';
    }
    page.shown.add(page_shown);
    if (app.currentPage() != null && app.currentPage().visible())
        page_shown(app.currentPage());

    //=======================================================

    return chitu;
}


