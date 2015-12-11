import site = require('Site');
import app = require('Application');
import move = require('move');
import menu = require('ui/Menu');
import TopBar = require('ui/TopBar');

class ScrollArguments {
    scrollTop: number
    scrollHeight: number
    clientHeight: number
}

function setPageSize(page: chitu.Page) {
    var page = <chitu.Page>page;

    var $wrapper = $(page.nodes().body);
    var $loading = $(page.nodes().loading);

    var h = $(window).height();
    var topbar: TopBar = page['topbar'];
    if (topbar) {
        h = h - topbar.height();
        $wrapper.css('top', topbar.height() + 'px');
        //$loading.css('top', topbar.height() + 'px');
    }

    if (menu.visible() || page.name == 'Home.Product') {
        h = h - menu.height();
    }

    $wrapper.height(h + 'px');
    $loading.height($(window).height() + 'px');
}

chitu['scroll'] = function (page: chitu.Page, config) {
    config = config || {};

    $.extend(page, {
        scrollEnd: chitu.Callbacks(),
        on_scrollEnd: function (args) {
            return chitu.fireCallback(this.scrollEnd, [this, args]);
        },
        scrollTop: function (value: any = undefined) {
            if (value === undefined)
                return this.node().scrollTop;

            this.node().scrollTop = value;
        }
    })

    //============================================================
    // 说明：实现滚动结束
    var cur_scroll_args: ScrollArguments = new ScrollArguments();
    var pre_scroll_top: number;
    var checking_num: number;
    var CHECK_INTERVAL = 300;
    var scrollEndCheck = (page: chitu.Page) => {
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
    //========================================================
    // 实现滚动
    var wrapper_node = page.nodes().body;
    wrapper_node.style.position = 'fixed';
    wrapper_node.style.height = $(window).height() + 'px';
    wrapper_node.style.width = '100%';
    wrapper_node.style.overflowY = 'auto';
    wrapper_node.style.overflowX = 'hidden';

    wrapper_node.style.height = $(window).height() + 'px';
    $(window).on('resize', () => {
        wrapper_node.style.height = $(window).height() + 'px';
    });

    var is_scrolled = false;
    wrapper_node.onscroll = () => {
        var args = {
            scrollTop: wrapper_node.scrollTop,
            scrollHeight: wrapper_node.scrollHeight,
            clientHeight: wrapper_node.clientHeight
        };

        page.on_scroll(args);

        cur_scroll_args.clientHeight = args.clientHeight;
        cur_scroll_args.scrollHeight = args.scrollHeight;
        cur_scroll_args.scrollTop = args.scrollTop;
        scrollEndCheck(page);
    };
    //========================================================

    var page_shown = (sender: chitu.Page) => {
        //if (menu && menu.visible()) {
        //    //$(wrapper_node).css('padding-bottom', menu.height());
        //}
        setPageSize(sender);
    }
    if (app.currentPage() != null && app.currentPage().visible())
        page_shown(app.currentPage());

    $(window).on('resize', function () {
        setPageSize(page);
    });

    
};