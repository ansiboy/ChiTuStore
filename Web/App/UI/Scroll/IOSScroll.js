define(["require", "exports", 'ui/Menu', 'iscroll'], function (require, exports, menu, IScroll) {
    var _this = this;
    var ScrollArguments = (function () {
        function ScrollArguments() {
        }
        return ScrollArguments;
    })();
    function setPageSize(sender) {
        /// <param name="sender" type="chitu.Page"/>
        var page = sender;
        var $wrapper = $(sender.nodes().body);
        var $scroller = $(sender.nodes().content);
        var $loading = $(sender.nodes().loading);
        var h = $(window).height();
        var topbar = page['topbar'];
        if (topbar) {
            h = h - topbar.height();
            $wrapper.css('top', topbar.height() + 'px');
            $loading.css('padding-top', topbar.height() + 'px');
        }
        if (menu.visible() || page.name == 'Home.Product') {
            h = h - menu.height();
        }
        $wrapper.height(h + 'px');
        $loading.height(h + 'px');
    }
    function createScroll(page) {
        var touchend_handled = false;
        var wrapperNode = page['_wrapperNode'];
        var options = {
            tap: true,
            useTransition: false,
            HWCompositing: false,
            preventDefault: true,
            probeType: 1,
        };
        var iscroller = page['iscroller'] = new IScroll(wrapperNode, options);
        iscroller.on('scrollEnd', function () {
            var scroller = this;
            var args = {
                scrollTop: 0 - scroller.y,
                scrollHeight: scroller.scrollerHeight,
                clientHeight: scroller.wrapperHeight
            };
            console.log('directionY:' + scroller.directionY);
            console.log('startY:' + scroller.startY);
            console.log('scroller.y:' + scroller.y);
            page['on_scrollEnd'](args);
        });
        iscroller.on('scroll', function () {
            var scroller = this;
            var args = {
                scrollTop: 0 - scroller.y,
                scrollHeight: scroller.scrollerHeight,
                clientHeight: scroller.wrapperHeight
            };
            console.log('directionY:' + scroller.directionY);
            console.log('startY:' + scroller.startY);
            console.log('scroller.y:' + scroller.y);
            page.on_scroll(args);
        });
        return iscroller;
    }
    chitu.scroll = function (page, config) {
        $(page.nodes().body).addClass('wrapper');
        $(page.nodes().content).addClass('scroller');
        var wrapperNode = page['_wrapperNode'] = page.nodes().body;
        page['_scrollerNode'] = page.nodes().content;
        $.extend(page, {
            scrollEnd: chitu.Callbacks(),
            on_scrollEnd: function (args) {
                return chitu.fireCallback(this.scrollEnd, [this, args]);
            },
            scrollTop: $.proxy(function (value) {
                if (value === undefined)
                    return (0 - page['iscroller'].y) + 'px';
                if (typeof value === 'string')
                    value = new Number(value.substr(0, value.length - 2)).valueOf();
                var scroller = _this['iscroller'];
                if (scroller) {
                    scroller.scrollTo(0, value);
                }
            }, page)
        });
        var scroller = createScroll(page);
        (function (scroller) {
            $(wrapperNode).on('tap', function (event) {
                if (page['iscroller'].enabled == false)
                    return;
                var MAX_DEEPH = 4;
                var deeph = 1;
                var node = event.target;
                while (node != null) {
                    if (node.tagName == 'A')
                        return window.open($(node).attr('href'), '_self');
                    node = node.parentNode;
                    deeph = deeph + 1;
                    if (deeph > MAX_DEEPH)
                        return;
                }
            });
        })(scroller);
        var page_shown = function (sender) {
            setPageSize(sender);
            window.setTimeout(function () {
                page['iscroller'].refresh();
            }, 500);
        };
        page.shown.add(page_shown);
        if (page.visible())
            page_shown(page);
        $(window).on('resize', function () {
            window.setTimeout(function () {
                page['iscroller'].refresh();
            }, 500);
            setPageSize(page);
        });
        page.closed.add(function (sender, args) {
            page['iscroller'].destroy();
        });
    };
});
