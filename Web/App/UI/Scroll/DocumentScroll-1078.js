(function (factory) {
    var references = [];
    if (!window['chitu']) references.push('chitu');

    if (typeof requirejs === 'function') {
        requirejs(references, factory);
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

        page.shown.add(function (sender) {
            /// <param name="sender" type="chitu.Page"/>
            if (!site.menu)
                return;

            if (site.menu.isVisible()) {
                sender.node().style.paddingBottom = site.menu.height() + 'px';
            }
            else {
                sender.node().style.paddingBottom = '0px';
            }
            page.node().style.marginBottom = '0px';
        })
        //=======================================================
       
        return chitu;
    }

    return chitu;
});