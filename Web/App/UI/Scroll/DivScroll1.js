(function (factory) {
    var references = [];
    if (!window['chitu']) references.push('chitu');

    if (typeof requirejs === 'function') {
        define(['chitu'], factory);
    } else {
        factory();
    }
})(function () {

    var pages = [];
    chitu.scroll = function (page, config) {
        /// <param name="page" type="chitu.Page"/>

        if ($.inArray(page, pages) >= 0)
            return;

        pages.push(page);

        var wrapperNode = document.createElement('div');
        wrapperNode.className = '';

        page.node().appendChild(wrapperNode);
        $(page.node()).find('.page-body')//.addClass('scroller')
            .css({ 'height': '', 'minHeight': '' })
            .appendTo(wrapperNode);

        var $node = $(page.node()).find('.page-body').parent();
        //=======================================================
        // 属性
        page.scroll = $.Callbacks();

        page.on_scroll = $.proxy(function (args) {
            return chitu.fireCallback(this.scroll, [this, args]);
        }, page);

        page.scrollTop = $.proxy(function (value) {
            if (value === undefined)
                return this.node().scrollTop;

            this.node().scrollTop = value;
            //$(this.node()).scrollTop(0);

        }, page);
        //========================================================
        // 实现滚动
        $node[0].style.position = 'fixed';
        $node[0].style.height = $(window).height() + 'px';
        $node[0].style.width = '100%';
        $node[0].style.styleFloat = 'left';
        $node[0].style.overflow = 'auto';
        $node[0].style.overflowX = 'hidden';

        $(window).on('resize', $.proxy(function () {
            var page = this;
            //if (site.menu.isVisible()) {
            //    page.node().style.height = ($(document).height() - site.menu.height()) + 'px';
            //    page.node().style.bottom = site.menu.height() + 'px';
            //}
            //else {
            //    page.node().style.height = $(document).height() + 'px';
            //    page.node().style.bottom = '0px';
            //}
            page.node().style.height = $(window).height() + 'px';

        }, page));

        $node[0].onscroll = $.proxy(function (event) {
            //var pc = $(event.target).parent().data('PageContainer');
            //if (!pc || !pc.currentPage() || !($(pc.currentPage().node()).is(':visible')))
            //    return;

            //
            var currentPage = this;
            var args = {
                scrollTop: currentPage.node().scrollTop,
                scrollHeight: currentPage.node().scrollHeight,
                clientHeight: currentPage.node().clientHeight
            };

            currentPage.on_scroll(args);

        }, page);

        function on_shown(sender) {
            /// <param name="sender" type="chitu.Page"/>
            //if (!site.menu)
            //    return;

            var $content_node = $(sender.node()).find('.page-body');

            var h = 0;
            if (site.menu && site.menu.isVisible()) {
                //h = h + site.menu.height();
                $content_node.css('padding-bottom', site.menu.height());
            }

            if (sender.topbar != null && sender.topbar.visible()) {
                //h = h + sender.topbar.height();
                $content_node.css('padding-top', sender.topbar.height());
            }

            //if (h > 0) {
            //    sender.node().style.height = ($(document).height() - h) + 'px';
            //}
            //else {
            //    sender.node().style.height = $(document).height() + 'px';
            //}


            //if (sender.topbar && sender.topbar.visible()) {
            //    $node.css('top', sender.topbar.height() + 'px');
            //}
            //else {
            //    $node.css('top', '0px');
            //}


            //page.node().style.marginBottom = '0px';
        }

        page.shown.add(on_shown);
        if (app.currentPage() != null && app.currentPage().visible())
            on_shown(app.currentPage());

        //if (!config.recordPosition) {
        //    page.shown.add(function () {
        //        page.scrollTop(0);
        //        //$(page.node()).css('top', 0);
        //    });
        //}
    };
});