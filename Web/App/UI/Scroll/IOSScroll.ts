import site = require('Site');
import menu = require('ui/Menu');
import app = require('Application');
import IScroll = require('iscroll');
import move = require('move');
import TopBar = require('ui/TopBar');

class ScrollArguments {
    scrollTop: number
    scrollHeight: number
    clientHeight: number
}


function setPageSize(sender: chitu.Page) {
    /// <param name="sender" type="chitu.Page"/>

    var page = <chitu.Page>sender;

    var $wrapper = $(sender.nodes().body);
    var $scroller = $(sender.nodes().content);
    var $loading = $(sender.nodes().loading);

    var h = $(window).height();
    var topbar: TopBar = page['topbar'];
    if (topbar) {
        //===================================================
        // 说明：在 IOS 下，一定要使用 TOP，使用 padding-top ，顶栏（标题栏）偶尔会给遮住
        h = h - topbar.height();
        $wrapper.css('top', topbar.height() + 'px');
        //===================================================
        $loading.css('padding-top', topbar.height() + 'px');
    }

    if (menu.visible() || page.name == 'Home.Product') {//Hard Code
        h = h - menu.height();
        //$scroller.css('padding-bottom', menu.height() + 'px');
        //$loading.css('padding-bottom', menu.height() + 'px');
    }

    $wrapper.height(h + 'px');
    $loading.height(h + 'px');

}

function createScroll(page: chitu.Page): IScroll {
    var touchend_handled = false;

    var wrapperNode = <HTMLElement>page['_wrapperNode'];
    var options = {
        tap: true,
        useTransition: false,
        HWCompositing: false,
        preventDefault: true,   // 必须设置为 True，否是在微信环境下，页面位置在上拉，或下拉时，会移动。
        probeType: 1,
        //bounce: true,
        //bounceTime: 600
    }
    var iscroller = page['iscroller'] = new IScroll(wrapperNode, options);
    iscroller.on('scrollEnd', function () {
        var scroller = <IScroll>this;
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
        var scroller = <IScroll>this;
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

(<any>chitu).scroll = (page: chitu.Page, config) => {


    $(page.nodes().body).addClass('wrapper');
    $(page.nodes().content).addClass('scroller');

    var wrapperNode = page['_wrapperNode'] = page.nodes().body;
    page['_scrollerNode'] = page.nodes().content;

    $.extend(page, {
        scrollEnd: chitu.Callbacks(),
        on_scrollEnd: function (args) {
            return chitu.fireCallback(this.scrollEnd, [this, args]);
        },
        scrollTop: $.proxy((value: number | string) => {
            if (value === undefined)
                return (0 - page['iscroller'].y) + 'px';

            if (typeof value === 'string')
                value = new Number((<string>value).substr(0, (<string>value).length - 2)).valueOf();

            var scroller = this['iscroller'];
            if (scroller) {
                scroller.scrollTo(0, value);
            }
        }, page)
    })


    var scroller = createScroll(page);

    (function (scroller: IScroll) {

        $(wrapperNode).on('tap', (event) => {
            if (page['iscroller'].enabled == false)
                return;

            var MAX_DEEPH = 4;
            var deeph = 1;
            var node = <HTMLElement>event.target;
            while (node != null) {
                if (node.tagName == 'A')
                    return window.open($(node).attr('href'), '_self');

                node = <HTMLElement>node.parentNode;
                deeph = deeph + 1;
                if (deeph > MAX_DEEPH)
                    return;
            }
        })

    })(scroller);

    var page_shown = (sender: chitu.Page) => {
        setPageSize(sender);
        window.setTimeout(() => {
            page['iscroller'].refresh();
        }, 500);
    }

    page.shown.add(page_shown);
    if (page.visible())
        page_shown(page);

    $(window).on('resize', function () {
        //if (app.currentPage() != null && app.currentPage()['iscroller'] != null) {
        window.setTimeout(function () {
            page['iscroller'].refresh();
        }, 500);

        setPageSize(page);
        //}
    });

    page.closed.add((sender, args) => {
        (<IScroll>page['iscroller']).destroy();
    });
}
