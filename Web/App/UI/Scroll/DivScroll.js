define(["require", "exports", 'Application', 'ui/Menu'], function (require, exports, app, menu) {
    var ScrollArguments = (function () {
        function ScrollArguments() {
        }
        return ScrollArguments;
    })();
    function setPageSize(page) {
        var page = page;
        var $wrapper = $(page.nodes().body);
        var $loading = $(page.nodes().loading);
        var h = $(window).height();
        var topbar = page['topbar'];
        if (topbar) {
            h = h - topbar.height();
            $wrapper.css('top', topbar.height() + 'px');
        }
        if (menu.visible() || page.name == 'Home.Product') {
            h = h - menu.height();
        }
        $wrapper.height(h + 'px');
        $loading.height($(window).height() + 'px');
    }
    chitu['scroll'] = function (page, config) {
        config = config || {};
        $.extend(page, {
            scrollEnd: chitu.Callbacks(),
            on_scrollEnd: function (args) {
                return chitu.fireCallback(this.scrollEnd, [this, args]);
            },
            scrollTop: function (value) {
                if (value === void 0) { value = undefined; }
                if (value === undefined)
                    return this.node().scrollTop;
                this.node().scrollTop = value;
            }
        });
        var cur_scroll_args = new ScrollArguments();
        var pre_scroll_top;
        var checking_num;
        var CHECK_INTERVAL = 300;
        var scrollEndCheck = function (page) {
            if (checking_num != null)
                return;
            checking_num = 0;
            checking_num = window.setInterval(function () {
                if (pre_scroll_top == cur_scroll_args.scrollTop) {
                    window.clearInterval(checking_num);
                    checking_num = null;
                    pre_scroll_top = null;
                    page['on_scrollEnd'](cur_scroll_args);
                    return;
                }
                pre_scroll_top = cur_scroll_args.scrollTop;
            }, CHECK_INTERVAL);
        };
        var wrapper_node = page.nodes().body;
        wrapper_node.style.position = 'fixed';
        wrapper_node.style.height = $(window).height() + 'px';
        wrapper_node.style.width = '100%';
        wrapper_node.style.overflowY = 'auto';
        wrapper_node.style.overflowX = 'hidden';
        wrapper_node.style.height = $(window).height() + 'px';
        $(window).on('resize', function () {
            wrapper_node.style.height = $(window).height() + 'px';
        });
        var is_scrolled = false;
        wrapper_node.onscroll = function () {
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
        var page_shown = function (sender) {
            setPageSize(sender);
        };
        if (app.currentPage() != null && app.currentPage().visible())
            page_shown(app.currentPage());
        $(window).on('resize', function () {
            setPageSize(page);
        });
    };
});
