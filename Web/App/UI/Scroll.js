(function (factory) {
    var references = ['chitu']
    if (typeof define === 'function' && define.amd) {
        define(references, factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(require(references));
    } else {
        factory();
    }
})(function () {

    var pages = [];
    var scroll_top_name = 'ScrollTop';
    $(document).scroll(function (event) {
        var args = {
            scrollTop: $(document).scrollTop(),
            scrollHeight: document.body.scrollHeight,
            clientHeight: $(window).height()
        };
        for (var i = 0; i < pages.length; i++) {
            if ($(pages[i].node()).is(':visible')) {
                pages[i].on_scroll(args);
            }
        }
    });

    chitu.scroll = function (page) {
        /// <param name="page" type="chitu.Page"/>

        if ($.inArray(page, pages) >= 0)
            return;

        pages.push(page);

        //=======================================================
        // 属性
        page.scroll = chitu.Callbacks();

        page.on_scroll = $.proxy(function (args) {
            return chitu.fireCallback(this.scroll, [this, args]);
        }, page);

        page.scrollTop = $.proxy(function (value) {
            if (value === undefined)
                return $(document.body).scrollTop() || $(document).scrollTop();

            if ($(document.body).scrollTop() != null) {
                $(document.body).scrollTop(value);
            }
            else {
                $(document).scrollTop(value);
            }

        }, page);

        //=======================================================
        // 事件
        page.shown.add(function (sender) {
            // 说明：显示页面，scrollTop 定位
            sender.scrollTop($(sender.node()).data(scroll_top_name) || '0px');
        });

        page.scroll.add(function (sender, args) {
            $(sender.node()).data(scroll_top_name, sender.scrollTop());
        });

        //=======================================================

        return chitu;
    }

    return chitu;
});