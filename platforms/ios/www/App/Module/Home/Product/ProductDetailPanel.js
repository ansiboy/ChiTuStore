define(["require", "exports", 'move', 'Site', 'hammer', 'Services/Shopping', 'knockout', 'iscroll', 'knockout.mapping'], function (require, exports, move, site, Hammer, shopping, ko, IScroll, mapping) {
    "use strict";
    var show_time = site.config.pageAnimationTime;
    var ProductDetailPanel = (function () {
        function ProductDetailPanel(page) {
            var _this = this;
            this._loaded = false;
            this.enablePullDown = false;
            this.show = function (productId) {
                var result = $.Deferred();
                _this.pan_move = move(_this._node);
                _this.pan_move.y(0).duration(show_time).end(function () {
                    result.resolve();
                });
                if (!_this._loaded) {
                    var load_html = $.Deferred();
                    requirejs(['text!Module/Home/Product/ProductDetailPanel.html'], function (html) {
                        _this._node.innerHTML = html;
                        load_html.resolve(html);
                        _this.content_node = $(_this._node).find('.container')[0];
                        var rect = _this.content_node.getBoundingClientRect();
                        _this.start_pos = rect.top;
                    });
                    $.when(shopping.getProductIntroduce(productId), load_html).done(_this.on_dataLoad);
                }
                else {
                    _this.model.Introduce('<div class="spin"><i class="icon-spinner icon-spin" ></i><div></div></div>');
                    shopping.getProductIntroduce(productId).done(function (data) {
                        mapping.fromJS(data, {}, _this.model);
                    });
                }
                var iscroll = _this._page['iscroller'];
                if (iscroll != null && iscroll.enable()) {
                    iscroll.disable();
                    _this.disable_iscroll = true;
                    console.log('disable page iscroll');
                }
                return result;
            };
            this.on_pageClosed = function (sender) {
                debugger;
                $(_this._node).remove();
            };
            this.on_dataLoad = function (data) {
                _this.model = mapping.fromJS(data[0]);
                ko.applyBindings(_this.model, _this._node);
                if (site.env.isIOS) {
                    var options = {
                        tap: true,
                        useTransition: false,
                        HWCompositing: false,
                        preventDefault: true,
                    };
                    _this.iscroll = new IScroll(_this._node, options);
                    window.setTimeout(function () { return _this.iscroll.refresh(); }, 1000);
                }
                _this._loaded = true;
            };
            this.hide = function () {
                _this._node.style.transform = '';
                _this.pan_move.y($(window).height()).duration(show_time).end(function () {
                    if (_this.disable_iscroll == true) {
                        _this._page['iscroller'].enable();
                    }
                });
            };
            this.on_panstart = function (e) {
                _this.enablePullDown = _this.content_node != null &&
                    Math.abs(_this.content_node.getBoundingClientRect().top - _this.start_pos) <= 20 &&
                    e['direction'] == Hammer.DIRECTION_DOWN;
                if (_this.enablePullDown && _this.iscroll != null) {
                    _this.iscroll.enabled = false;
                }
                _this.pre_deltaY = e['deltaY'];
            };
            this.on_pan = function (e) {
                if (e.deltaY >= 65 || !_this.enablePullDown)
                    return;
                console.log('deltaY:' + e['deltaY']);
                var d = e['deltaY'] - _this.pre_deltaY;
                console.log('d:' + d);
                _this.pan_move.y(d).duration(0).end();
                _this.pre_deltaY = e['deltaY'];
            };
            this.on_panend = function (e) {
                if (_this.enablePullDown == false)
                    return;
                if (e.deltaY > 30) {
                    _this.hide();
                }
                else {
                    move(_this._node).duration(show_time).end();
                }
                if (_this.iscroll) {
                    _this.iscroll.enabled = true;
                }
            };
            this._page = page;
            this._node = document.createElement('div');
            this._node.style.position = 'fixed';
            this._node.style.height = ($(window).height() - 50) + 'px';
            this._node.className = 'product-detail wrapper';
            page.container.element.appendChild(this._node);
            this._hammer = new Hammer.Manager(this._node);
            this._hammer.get('pan').set({ direction: Hammer.DIRECTION_DOWN | Hammer.DIRECTION_UP });
            this._hammer.on('panstart', this.on_panstart);
            this._hammer.on('pan', this.on_pan);
            this._hammer.on('panend', this.on_panend);
            this.pan_move = move(this._node);
            this.hide();
            debugger;
            this._page.closed.add(this.on_pageClosed);
        }
        return ProductDetailPanel;
    }());
    return ProductDetailPanel;
});
