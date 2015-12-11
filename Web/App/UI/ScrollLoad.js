define(["require", "exports", 'Site', 'move', 'hammer'], function (require, exports, site, move, Hammer) {
    var PULLDOWN_EXECUTE_CRITICAL_HEIGHT = 60;
    var PULLUP_EXECUTE_CRITICAL_HEIGHT = 60;
    var ScrollArguments = (function () {
        function ScrollArguments() {
        }
        return ScrollArguments;
    })();
    var RefreshState = {
        init: 'init',
        ready: 'ready',
        doing: 'doing',
        done: 'done'
    };
    var PullDownStateText = {
        init: '<div style="padding-top:10px;">下拉可以刷新</div>',
        ready: '<div style="padding-top:10px;">松开后刷新</div>',
        doing: '<div style=""><i class="icon-spinner icon-spin"></i><span>&nbsp;正在更新中</span></div>',
        done: '<div style="padding-top:10px;">更新完毕</div>',
    };
    var PullUpStateText = {
        init: '上拉可以刷新',
        ready: '松开后刷新',
        doing: '<div><i class="icon-spinner icon-spin"></i><span>&nbsp;正在更新中</span></div>',
        done: '更新完毕',
    };
    var LOAD_MORE_HTML = '<span>上拉加载更多数据</span>';
    var LOADDING_HTML = '<i class="icon-spinner icon-spin"></i><span style="padding-left:10px;">数据正在加载中...</span>';
    var LOAD_COMPLETE_HTML = '<span style="padding-left:10px;"></span>';
    var PullDownBar = (function () {
        function PullDownBar(config) {
            this._config = config;
            this.status(RefreshState.init);
        }
        PullDownBar.prototype.status = function (value) {
            if (value === void 0) { value = undefined; }
            if (value === undefined)
                return this._status;
            this._status = value;
            this._config.text(value);
        };
        PullDownBar.prototype.execute = function () {
            var _this = this;
            var result = $.Deferred();
            window.setTimeout(function () { return result.resolve(); }, 2000);
            result.done(function () { return _this.status(RefreshState.init); });
            return result;
        };
        PullDownBar.createPullDownBar = function (page, config) {
            config = config || {};
            config = $.extend({
                text: function (status) {
                    this.element.innerHTML = PullDownStateText[status];
                }
            }, config);
            var node = config.element;
            var status;
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
        };
        return PullDownBar;
    })();
    var PullUpBar = (function () {
        function PullUpBar(config) {
            this._config = config;
            this.status(RefreshState.init);
        }
        PullUpBar.prototype.status = function (value) {
            if (value === void 0) { value = undefined; }
            if (value === undefined)
                return this._status;
            this._status = value;
            this._config.text(value);
        };
        PullUpBar.prototype.execute = function () {
            var _this = this;
            var result = this._config.execute();
            if (result != null && $.isFunction(result.done)) {
                result.done(function () { return _this.status(RefreshState.init); });
            }
            return result;
        };
        PullUpBar.createPullUpBar = function (page, config) {
            config = config || {};
            config = $.extend({
                execute: function () { },
                text: function (status) {
                    this.element.innerHTML = PullUpStateText[status];
                }
            }, config);
            var node = page.nodes()['pullup'];
            var status;
            if (node == null) {
                node = document.createElement('div');
                node.className = 'page-pullup';
                node.style.textAlign = 'center';
                var cn = page.nodes().content;
                cn.appendChild(node);
            }
            config.element = node;
            return new PullUpBar(config);
        };
        return PullUpBar;
    })();
    function createMove(page) {
        var m;
        m = move(page.nodes().content);
        return m;
    }
    var PULL_DOWN_MAX_HEIGHT = 150;
    var PULL_UP_MAX_HEIGHT = 150;
    var MINI_MOVE_DISTANCE = 3;
    function enable_divfixed_gesture(page, pullDownBar, pullUpBar) {
        var pre_deltaY = 0;
        var cur_scroll_args = page['cur_scroll_args'];
        var content_move = createMove(page);
        var body_move;
        var enablePullUp = false;
        var start_pos;
        var delta_height;
        var enablePullDown = false;
        var hammer = new Hammer(page.nodes().content);
        hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN });
        hammer.on('panstart', function (e) {
            var rect = page.nodes().content.getBoundingClientRect();
            var parent_rect = page.nodes().body.getBoundingClientRect();
            if (start_pos == null) {
                start_pos = rect.top;
            }
            if (delta_height == null) {
                delta_height = rect.height - $(page.nodes().body).height();
            }
            pre_deltaY = e['deltaY'];
            enablePullUp = pullUpBar != null && Math.abs(parent_rect.bottom - rect.bottom) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
            if (enablePullUp)
                body_move = move(page.nodes().body);
            enablePullDown = pullDownBar != null && Math.abs(rect.top - start_pos) <= 20 && e['direction'] == Hammer.DIRECTION_DOWN;
            if (enablePullDown === true) {
                hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN, domEvents: false });
            }
        });
        hammer.on('pan', function (e) {
            var delta;
            var event = e;
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
                event.preventDefault();
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
            pre_deltaY = e['deltaY'];
        });
        hammer.on('panend', function (e) {
            var scroll_deferred = $.Deferred();
            if (enablePullDown === true) {
                if (pullDownBar.status() == RefreshState.ready) {
                    content_move
                        .set('top', PULLDOWN_EXECUTE_CRITICAL_HEIGHT + 'px')
                        .duration(200)
                        .end();
                    pullDownBar.status(RefreshState.doing);
                    pullDownBar.execute().done(function () {
                        pullDownBar.status(RefreshState.done);
                        content_move.set('top', '0px').duration(500).end(function () {
                            console.log('scrollTop');
                            scroll_deferred.resolve();
                        });
                    });
                }
                else {
                    content_move.set('top', '0px').duration(200).end(function () { return scroll_deferred.resolve(); });
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
    function enable_iscroll_gesture(page, pullDownBar, pullUpBar) {
        console.log('enable_ios_gesture');
        var pre_deltaY = 0;
        var cur_scroll_args = page['cur_scroll_args'];
        var content_move = createMove(page);
        var body_move;
        var disable_iscroll;
        var enablePullUp = false;
        var enablePullDown = false;
        var hammer = new Hammer(page.nodes().content);
        hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN });
        hammer.on('panstart', function (e) {
            pre_deltaY = e['deltaY'];
            enablePullUp = pullUpBar != null && Math.abs(page['iscroller'].startY - page['iscroller'].maxScrollY) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
            if (enablePullUp)
                body_move = move(page.nodes().body);
            enablePullDown = pullDownBar != null && Math.abs(page['iscroller'].startY) <= 20 && e['direction'] == Hammer.DIRECTION_DOWN;
            if (enablePullDown === true || enablePullUp === true) {
                if (page['iscroller'].enabled) {
                    page['iscroller'].disable();
                    console.log('iscrol disable');
                    disable_iscroll = true;
                }
                hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN, domEvents: false });
            }
        });
        hammer.on('pan', function (e) {
            var event = e;
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
            event.preventDefault();
            pre_deltaY = e['deltaY'];
        });
        hammer.on('panend', function (e) {
            var scroll_deferred = $.Deferred();
            if (enablePullDown === true) {
                if (pullDownBar.status() == RefreshState.ready) {
                    content_move
                        .set('top', PULLDOWN_EXECUTE_CRITICAL_HEIGHT + 'px')
                        .duration(200)
                        .end();
                    pullDownBar.status(RefreshState.doing);
                    pullDownBar.execute().done(function () {
                        pullDownBar.status(RefreshState.done);
                        content_move.set('top', '0px').duration(500).end(function () {
                            console.log('scrollTop');
                            scroll_deferred.resolve();
                        });
                    });
                }
                else {
                    content_move.set('top', '0px').duration(200).end(function () { return scroll_deferred.resolve(); });
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
            enablePullUp = pullUpBar != null && Math.abs(page['iscroller'].startY - page['iscroller'].maxScrollY) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
            console.log(pullUpBar);
            console.log(page['iscroller']);
            console.log('enablePullUp:' + enablePullUp);
            enablePullDown = pullDownBar != null && rect.top <= 0 && e['direction'] == Hammer.DIRECTION_DOWN;
            window.setTimeout(function () {
                if (disable_iscroll)
                    page['iscroller'].enable();
            }, 100);
        });
    }
    var ScrollStatus;
    (function (ScrollStatus) {
        ScrollStatus[ScrollStatus["Scrolling"] = 0] = "Scrolling";
        ScrollStatus[ScrollStatus["ScrollEnd"] = 1] = "ScrollEnd";
    })(ScrollStatus || (ScrollStatus = {}));
    var scrollStatus = ScrollStatus.ScrollEnd;
    var pages = [];
    var entrance = function (page, config, loadData) {
        var cur_scroll_args = page['cur_scroll_args'] = new ScrollArguments();
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
        var pullDownBar;
        if (config['pullDown'])
            pullDownBar = PullDownBar.createPullDownBar(page, config['pullDown']);
        var pullUpBar;
        if (config['pullUp']) {
            pullUpBar = PullUpBar.createPullUpBar(page, config['pullUp']);
        }
        chitu['scroll'](page, config);
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
                var self = this;
                var result = loadData();
                result.done(function () {
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
        page.scroll.add(function () { return scrollStatus = ScrollStatus.Scrolling; });
        page['scrollEnd'].add(function (sender, args) {
            scrollStatus = ScrollStatus.ScrollEnd;
            var scrollTop = cur_scroll_args.scrollTop = args.scrollTop;
            var scrollHeight = cur_scroll_args.scrollHeight = args.scrollHeight;
            var clientHeight = cur_scroll_args.clientHeight = args.clientHeight;
            var marginBottom = clientHeight / 3;
            if (clientHeight + scrollTop < scrollHeight - marginBottom)
                return;
            chitu.fireCallback(sender['scrollBottom'], [sender]);
        });
        if (page['scrollLoad'] != null) {
            var $scrollLoad_loading = $(page.node()).find('[name="scrollLoad_loading"]');
            if ($scrollLoad_loading.length == 0) {
                var node = page.nodes().content;
                $scrollLoad_loading = $('<div name="scrollLoad_loading" style="padding:10px 0px 10px 0px;"><h5 class="text-center"></h5></div>')
                    .appendTo(node);
            }
            $scrollLoad_loading.find('h5').html(LOADDING_HTML);
            page['scrollLoad']();
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
    };
    exports.scrollLoad = chitu['scrollLoad'] = function (page, config, loadData) {
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
        entrance(page, config, loadData);
    };
});
