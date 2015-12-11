//var site = window['site'];
import site = require('Site');
import menu = require('ui/Menu');
import move = require('move');
import Hammer = require('hammer');

//========================================================================
// 说明：下拉刷新
var PULLDOWN_EXECUTE_CRITICAL_HEIGHT = 60;   //刷新临界高度值，大于这个高度则进行刷新
var PULLUP_EXECUTE_CRITICAL_HEIGHT = 60; 
//var PULLUP_BAR_HEIGHT = 30;

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

var PullDownStateText = {
    init: '<div style="padding-top:10px;">下拉可以刷新</div>',
    ready: '<div style="padding-top:10px;">松开后刷新</div>',
    doing: '<div style=""><i class="icon-spinner icon-spin"></i><span>&nbsp;正在更新中</span></div>',
    done: '<div style="padding-top:10px;">更新完毕</div>',
}

var PullUpStateText = {
    init: '上拉可以刷新',
    ready: '松开后刷新',
    doing: '<div><i class="icon-spinner icon-spin"></i><span>&nbsp;正在更新中</span></div>',
    done: '更新完毕',
}

var LOAD_MORE_HTML = '<span>上拉加载更多数据</span>';
var LOADDING_HTML = '<i class="icon-spinner icon-spin"></i><span style="padding-left:10px;">数据正在加载中...</span>';
var LOAD_COMPLETE_HTML = '<span style="padding-left:10px;"></span>';//数据已全部加载完毕
//========================================================================


class PullDownBar {
    private _status: string;
    private _config: any;

    constructor(config) {
        this._config = config;
        this.status(RefreshState.init);
    }
    status(value: string = undefined): string {
        if (value === undefined)
            return this._status;

        this._status = value;
        this._config.text(value);

    }
    execute(): JQueryPromise<any> {
        //TODO:现在这里啥也没有处理，之后是要读取数据的
        var result = $.Deferred();
        window.setTimeout(() => result.resolve(), 2000);
        //this.status(RefreshState.init);
        result.done(() => this.status(RefreshState.init));
        return result;
    }

    static createPullDownBar(page: chitu.Page, config): PullDownBar {
        config = config || {};
        config = $.extend({
            text: function (status) {
                (<HTMLElement>this.element).innerHTML = PullDownStateText[status];
            }
        }, config);

        var node = <HTMLElement>config.element;
        var status: string;
        if (node == null) {
            node = document.createElement('div');
            node.className = 'page-pulldown';
            node.innerHTML = PullUpStateText.init;

            var cn = page.nodes().content;
            if (cn.childNodes.length == 0) {
                cn.appendChild(node);
            }
            else {
                cn.insertBefore(node, cn.childNodes[0]);
            }

            config.element = node;
        }

        var bar = new PullDownBar(config);
        return bar;
    }
}

class PullUpBar {
    private _status: string;
    private _config: any;

    constructor(config: any) {
        this._config = config;
        this.status(RefreshState.init);
    }

    status(value: string = undefined): string {
        if (value === undefined)
            return this._status;

        this._status = value;
        this._config.text(value);
    }

    execute() {
        var result: JQueryPromise<any> = this._config.execute();
        if (result != null && $.isFunction(result.done)) {
            result.done(() => this.status(RefreshState.init));
        }

        return result;
    }

    static createPullUpBar(page: chitu.Page, config): PullUpBar {
        config = config || {};
        config = $.extend({
            execute: function () { },
            text: function (status) {
                (<HTMLElement>this.element).innerHTML = PullUpStateText[status];
            }
        }, config);

        var node = <HTMLElement>page.nodes()['pullup'];
        var status: string;
        if (node == null) {
            node = document.createElement('div');
            node.className = 'page-pullup';
            //node.style.height = PULLUP_BAR_HEIGHT + 'px';
            node.style.textAlign = 'center';

            var cn = page.nodes().content;
            cn.appendChild(node);

        }

        config.element = node;
        return new PullUpBar(config);
    }
}


function createMove(page: chitu.Page): Move {
    var m: Move;
    m = move(page.nodes().content);

    return m;
}

var PULL_DOWN_MAX_HEIGHT = 150;
var PULL_UP_MAX_HEIGHT = 150;
var MINI_MOVE_DISTANCE = 3;

function enable_divfixed_gesture(page: chitu.Page, pullDownBar: PullDownBar, pullUpBar: PullUpBar) {
    var pre_deltaY = 0;
    var cur_scroll_args: ScrollArguments = page['cur_scroll_args'];
    var content_move = createMove(page);
    var body_move: Move;
    //========================================================
    // 说明：判断页面是否已经滚动底部（可以向上拉动刷新的依据之一）。
    var enablePullUp = false;
    //==================================================================
    // 说明：以下代码是实现下拉更新，但注意在 ISO 中，估计是由于使用了 IScroll，
    // 不能使用 transform，只能设置 top 来进行位移。
    var start_pos: number;
    var delta_height: number;
    var enablePullDown: boolean = false;// pullDownBar != null;
    var hammer = new Hammer(page.nodes().content);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN });

    //$(page.nodes().body).mousedown(() => {
    //    var rect = page.nodes().content.getBoundingClientRect();
    //    if (start_pos == null)
    //        start_pos = rect.top;

    //});

    hammer.on('panstart', function (e: PanEvent) {
        var rect = page.nodes().content.getBoundingClientRect();
        var parent_rect = page.nodes().body.getBoundingClientRect();

        if (start_pos == null) {
            start_pos = rect.top;
        }

        if (delta_height == null) {
            delta_height = rect.height - $(page.nodes().body).height();
        }

        pre_deltaY = e['deltaY'];

        //====================================================================
        // 如果已经滚动到底部，则允许上拉
        enablePullUp = pullUpBar != null && Math.abs(parent_rect.bottom - rect.bottom) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
        if (enablePullUp)
            body_move = move(page.nodes().body);
        //====================================================================
        // 如果页面处内容处理顶部 <= 20（不应该使用 0，允许误差），并且向下拉，则开始下拉事件
        enablePullDown = pullDownBar != null && Math.abs(rect.top - start_pos) <= 20 && e['direction'] == Hammer.DIRECTION_DOWN;
        //====================================================================
        if (enablePullDown === true) {
            hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN, domEvents: false });
        }

    })

    hammer.on('pan', function (e: Event) {
        var delta

        var event: any = e;
        if (event.distance > PULL_DOWN_MAX_HEIGHT)
            return;

        if (enablePullDown === true) {
            content_move.set('top', event.deltaY + 'px').duration(0).end();
            if (Math.abs(event.deltaY) > PULLDOWN_EXECUTE_CRITICAL_HEIGHT) {
                pullDownBar.status(RefreshState.ready);
            }
            else {
                pullDownBar.status(RefreshState.init);
            }

            //pre_deltaY = event.deltaY;
            //======================================
            // 说明：如果已经处理该事件处理，就可以阻止了。
            event.preventDefault();
            //======================================
        }
        else if (enablePullUp) {
            body_move.y(event.deltaY - pre_deltaY).duration(0).end();
            if (Math.abs(event.deltaY) > PULLUP_EXECUTE_CRITICAL_HEIGHT) {
                pullUpBar.status(RefreshState.ready);
            }
            else {
                pullUpBar.status(RefreshState.init);
            }
        }

        pre_deltaY = e['deltaY']
    });

    hammer.on('panend', function (e: Event) {
        var scroll_deferred = $.Deferred();
        if (enablePullDown === true) {
            if (pullDownBar.status() == RefreshState.ready) {
                // 位置复原到为更新状态位置
                content_move
                    .set('top', PULLDOWN_EXECUTE_CRITICAL_HEIGHT + 'px')
                    .duration(200)
                    .end();
                //content_move.x()
                pullDownBar.status(RefreshState.doing);
                pullDownBar.execute().done(() => {
                    pullDownBar.status(RefreshState.done)
                    content_move.set('top', '0px').duration(500).end(() => {
                        console.log('scrollTop');
                        scroll_deferred.resolve()
                    });
                });


            }
            else {
                content_move.set('top', '0px').duration(200).end(() => scroll_deferred.resolve());
            }
        }
        else if (enablePullUp) {
            if (pullUpBar.status() == RefreshState.ready) {
                pullUpBar.execute();
            }

            console.log('d');
            var m = move(page.nodes().body);
            m.y(0).duration(200).end();
        }

    });
}

function enable_iscroll_gesture(page: chitu.Page, pullDownBar: PullDownBar, pullUpBar: PullUpBar) {
    console.log('enable_ios_gesture');

    var pre_deltaY = 0;
    var cur_scroll_args: ScrollArguments = page['cur_scroll_args'];
    var content_move = createMove(page);
    var body_move: Move;
    var disable_iscroll: boolean;
   
    //==================================================================
    // 允许向下刷新


    //========================================================
    // 说明：判断页面是否已经滚动底部（可以向上拉动刷新的依据之一）。
    var enablePullUp = false;
    //==================================================================
    // 说明：以下代码是实现下拉更新，但注意在 ISO 中，估计是由于使用了 IScroll，
    // 不能使用 transform，只能设置 top 来进行位移。
    var enablePullDown: boolean = false;// pullDownBar != null;
    var hammer = new Hammer(page.nodes().content);
    hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN });

    //var iscroller:ISc = page['iscroller'];
    hammer.on('panstart', function (e: Event) {
        pre_deltaY = e['deltaY']
   
        //var rect = page.nodes().content.getBoundingClientRect();
      
        //====================================================================
        // 如果已经滚动到底部，则允许上拉
        enablePullUp = pullUpBar != null && Math.abs(page['iscroller'].startY - page['iscroller'].maxScrollY) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
        if (enablePullUp)
            body_move = move(page.nodes().body);

        //====================================================================
        // 如果页面处内容处理顶部 <= 20（不应该使用 0，允许误差），并且向下拉，则开始下拉事件
        enablePullDown = pullDownBar != null && Math.abs(page['iscroller'].startY) <= 20 && e['direction'] == Hammer.DIRECTION_DOWN;
        //====================================================================
        if (enablePullDown === true || enablePullUp === true) {
            if (page['iscroller'].enabled) {
                page['iscroller'].disable();
                console.log('iscrol disable');
                disable_iscroll = true;
            }

            hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN, domEvents: false });
        }
    })

    hammer.on('pan', function (e: PanEvent) {

        var event: any = e;
        if (event.distance > PULL_DOWN_MAX_HEIGHT)
            return;

        if (enablePullDown === true) {
            content_move.set('top', event.deltaY + 'px').duration(0).end();

            if (event.deltaY > PULLDOWN_EXECUTE_CRITICAL_HEIGHT) {
                pullDownBar.status(RefreshState.ready);
            }
            else {
                pullDownBar.status(RefreshState.init);
            }

            //pre_deltaY = event.deltaY;
        }
        else if (enablePullUp) {
            //console.log('PullUp');
            body_move.y(event.deltaY - pre_deltaY).duration(0).end();
            if (Math.abs(event.deltaY) > PULLUP_EXECUTE_CRITICAL_HEIGHT) {
                pullUpBar.status(RefreshState.ready);
            }
            else {
                pullUpBar.status(RefreshState.init);
            }
        }

        //======================================
        // 说明：如果已经处理该事件处理，就可以阻止了。
        event.preventDefault();
        //======================================
        pre_deltaY = e['deltaY']
    });

    hammer.on('panend', function (e: Event) {
        var scroll_deferred = $.Deferred();
        if (enablePullDown === true) {
            if (pullDownBar.status() == RefreshState.ready) {
                // 位置复原到为更新状态位置
                content_move
                    .set('top', PULLDOWN_EXECUTE_CRITICAL_HEIGHT + 'px')
                    .duration(200)
                    .end();

                pullDownBar.status(RefreshState.doing);
                pullDownBar.execute().done(() => {
                    pullDownBar.status(RefreshState.done)
                    content_move.set('top', '0px').duration(500).end(() => {
                        console.log('scrollTop');
                        scroll_deferred.resolve()
                    });
                });


            }
            else {
                content_move.set('top', '0px').duration(200).end(() => scroll_deferred.resolve());
            }
        }
        else if (enablePullUp) {
            if (pullUpBar.status() == RefreshState.ready) {
                pullUpBar.execute();
            }

            var m = move(page.nodes().body);
            m.y(0).duration(200).end();
        }

        var rect = page.nodes().content.getBoundingClientRect();
        //====================================================================
        // 如果已经滚动到底部，则允许上拉
        enablePullUp = pullUpBar != null && Math.abs(page['iscroller'].startY - page['iscroller'].maxScrollY) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
        console.log(pullUpBar);
        console.log(page['iscroller']);
        console.log('enablePullUp:' + enablePullUp);
        //====================================================================
        enablePullDown = pullDownBar != null && rect.top <= 0 && e['direction'] == Hammer.DIRECTION_DOWN;
        //=============================================================
        // 一定要延时，否则会触发 tap 事件
        window.setTimeout(() => {
            if (disable_iscroll)
                page['iscroller'].enable();

        }, 100);
        //=============================================================

    });
}


enum ScrollStatus {
    Scrolling,
    ScrollEnd
}
var scrollStatus = ScrollStatus.ScrollEnd;

var pages = [];
var entrance = (page: chitu.Page, config, loadData) => {
    var cur_scroll_args: ScrollArguments = page['cur_scroll_args'] = new ScrollArguments();


    if ($.inArray(page, pages) >= 0)
        return;

    pages.push(page);

    if ($.isFunction(config)) {
        loadData = config;
        config = null;
    }

    config = $.extend({
        recordPosition: true,
        pullDown: null,
        pullUp: null

    }, config || {});

    var pullDownBar: PullDownBar;
    if (config['pullDown'])
        pullDownBar = PullDownBar.createPullDownBar(page, config['pullDown']);

    var pullUpBar: PullUpBar;
    if (config['pullUp']) {
        pullUpBar = PullUpBar.createPullUpBar(page, config['pullUp']);
        //if (menu == null || !menu.visible()) {
            //page.nodes().content.style.marginBottom = (0 - PULLUP_BAR_HEIGHT) + 'px';
        //}
    }

    chitu['scroll'](page, config);

    //=======================================================

    $.extend(page, {

        pullDown: chitu.Callbacks(),
        pullUp: chitu.Callbacks(),
        on_pullDown: function (args) {
            chitu.fireCallback(this.pullDown, [this, args]);
        },
        on_pullUp: function (args) {
            chitu.fireCallback(this.pullUp, [this, args]);
        },
        scrollCompleted: chitu.Callbacks(),
        scrollBottom: chitu.Callbacks(),
        loadCompleted: chitu.Callbacks(),
        _loadDataIsComplete: function (value) {
            if (value === undefined) {
                return this._scrollLoadComplete || false;
            }

            this._scrollLoadComplete = value;

        },
        scrollLoading: function (isLoading) {

            if (isLoading === undefined) {
                return this._scrollLoading || false;
            }

            this._scrollLoading = isLoading;

        },
        scrollLoad: $.proxy(function () {
            $(this.node()).find('[name="scrollLoad_loading"]').find('h5').html(LOADDING_HTML);
            this.scrollLoading(true);

            var self: chitu.Page = this;
            var result = loadData();
            result.done(() => {
                self['scrollLoading'](false);
                self['loadCompleted'].fire(self);

                if (self['iscroller']) {
                    window.setTimeout(function () {
                        self['iscroller'].refresh();
                    }, 500);
                }

                self['_loadDataIsComplete'](result.loadCompleted || false);
                if (self['_loadDataIsComplete']()) {
                    $(self.node()).find('[name="scrollLoad_loading"]').find('h5').html(LOAD_COMPLETE_HTML);
                }
            });

            return result;

        }, page)
    });

    if (!loadData)
        page['scrollLoad'] = null;


    page['scrollBottom'].add(function (sender, args) {

        if (sender.scrollLoad == null)
            return;

        if (sender._loadDataIsComplete())
            return;

        if (sender.scrollLoading()) {
            return;
        }

        sender.scrollLoad();
    });


    page.scroll.add(() => scrollStatus = ScrollStatus.Scrolling);

    page['scrollEnd'].add(function (sender: chitu.Page, args) {
        scrollStatus = ScrollStatus.ScrollEnd;

        var scrollTop = cur_scroll_args.scrollTop = args.scrollTop;
        var scrollHeight = cur_scroll_args.scrollHeight = args.scrollHeight;
        var clientHeight = cur_scroll_args.clientHeight = args.clientHeight;
        
        //====================================================================

        var marginBottom = clientHeight / 3;
        if (clientHeight + scrollTop < scrollHeight - marginBottom)//
            return;

        chitu.fireCallback(sender['scrollBottom'], [sender]);
    });

    //=======================================================

    if (page['scrollLoad'] != null) {
        var $scrollLoad_loading = $(page.node()).find('[name="scrollLoad_loading"]');
        if ($scrollLoad_loading.length == 0) {
            var node = page.nodes().content;
            $scrollLoad_loading = $('<div name="scrollLoad_loading" style="padding:10px 0px 10px 0px;"><h5 class="text-center"></h5></div>')
                .appendTo(node);
        }
        $scrollLoad_loading.find('h5').html(LOADDING_HTML);
        page['scrollLoad']();//return
    }

    if (site.env.isIOS) {
        enable_iscroll_gesture(page, pullDownBar, pullUpBar);
    }
    else if (site.env.isAndroid) {
        enable_divfixed_gesture(page, pullDownBar, pullUpBar);
    }
    else if (site.env.isQQ) {
        enable_divfixed_gesture(page, pullDownBar, pullUpBar);
    }

}


//========================================================================

export var scrollLoad = chitu['scrollLoad'] = function (page: chitu.Page, config, loadData) {

    //var references = ['chitu', 'move'];
    //if (site.browser.isSafari) {
    //    references.push('ui/Scroll/IOSScroll');
    //}
    //else if (site.browser.isChrome) {
    //    references.push('ui/Scroll/DivScroll')
    //}
    //else if (site.browser.isQQ) {
    //    references.push('ui/Scroll/DivScroll')
    //}
    ////else if (site.env.isQQ()) {
    ////    //references.push('ui/Scroll/DocumentScroll')
    ////    references.push('ui/Scroll/DivScroll')
    ////}
    //else {
    //    references.push('ui/Scroll/DivScroll')
    //}

    //requirejs(references, function () {

    entrance(page, config, loadData);

    //})

}
