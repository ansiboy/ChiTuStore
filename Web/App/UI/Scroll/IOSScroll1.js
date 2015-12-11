(function (factory) {
    var references = ['chitu', 'scr/iscroll']
    if (typeof requirejs === 'function' && define.amd) {
        define(references, factory);
    }
    else {
        factory();
    }
})(function () {

    var pages = [];
    chitu.scroll = function (page, config) {
        /// <param name="page" type="chitu.Page"/>

        if ($.inArray(page, pages) >= 0) {
            return;
        }

        pages.push(page);

        var wrapperNode = page.nodes().bodyNode; //document.createElement('div');
        wrapperNode.className = 'wrapper';
        page._wrapperNode = wrapperNode;

        $(page.nodes().contentNode).addClass('scroller');
        //page.node().appendChild(wrapperNode);
        //$(page.node()).find('.page-body').addClass('scroller')
        //    .css({ 'height': '', 'minHeight': '' })
        //    .appendTo(wrapperNode);




        $(page.node()).on('tap', function (event) {

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

        page.scroll = chitu.Callbacks();
        page.scrollTop = $.proxy(function (value) {
            if (value === undefined)
                return (0 - this.iscroller.y) + 'px';

            if (typeof value === 'string')
                value = new Number(value.substr(0, value.length - 2)).valueOf();

            if (this.iscroller)
                this.iscroller.scrollTo(0, value);

        }, page)


        page.on_scroll = $.proxy(function (args) {
            return chitu.fireCallback(this.scroll, [this, args]);
        }, page);


        on_shown = function (sender) {
            /// <param name="sender" type="chitu.Page"/>
            setPageSize(sender);
            if (sender.iscroller == null) {
                createScroll(sender);
            }
            window.setTimeout($.proxy(function () {
                this.iscroller.refresh();
            }, sender), 500);

        };
        page.shown.add(on_shown);
        if (page.visible()) {
            on_shown(page);
        }
    };

    function createScroll(page) {
        //alert('h');
        page.iscroller = new IScroll(page._wrapperNode, {
            tap: true,
            //startY: page._$scrollTop || 0,
            useTransition: false,
            HWCompositing: false
        });

        page.iscroller.on('scrollEnd', $.proxy(function () {
            var args = {
                scrollTop: 0 - this.iscroller.y,
                scrollHeight: this.iscroller.scrollerHeight,
                clientHeight: this.iscroller.wrapperHeight
            };

            this.on_scroll(args);

        }, page));
    }



    function setPageSize(sender) {
        /// <param name="sender" type="chitu.Page"/>

        var $wrapper = $(sender._wrapperNode);
        var h = $(window).height();

        if (site.menu && site.menu.isVisible()) {
            //sender.node().parentNode.style.marginBottom = site.menu.height() + 'px';
            //$wrapper.css('bottom', site.menu.height() + 'px');
            h = h - site.menu.height();
        }
        else {
            //$wrapper.css('bottom', '0px');
        }

        if (sender.topbar && sender.topbar.visible()) {
            //sender.node().parentNode.style.marginTop = sender.topbar.height() + 'px';
            $wrapper.css('margin-top', sender.topbar.height() + 'px');
            h = h - sender.topbar.height();
        }
        else {
            //sender.node().parentNode.style.marginTop = '0px';
            $wrapper.css('margin-top', '0px');
        }

        $wrapper.css('height', h + 'px');
    }

    $(window).on('resize', function () {

        //alert('resize');
        window.setTimeout(function () {
            for (var i = 0; i < pages.length; i++) {
                if (pages[i].visible()) {
                    setPageSize(pages[i]);

                    if (pages[i].iscroller != null) {
                        pages[i].iscroller.refresh();
                    }

                }
            }
        }, 100);
    });
});