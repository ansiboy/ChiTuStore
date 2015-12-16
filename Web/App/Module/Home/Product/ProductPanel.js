define(["require", "exports", 'move', 'Site', 'knockout', 'Services/Shopping', 'iscroll', 'knockout.mapping'], function (require, exports, move, site, ko, shopping, IScroll, mapping) {
    var ProductPanelModel = (function () {
        function ProductPanelModel(panel, parent_model) {
            var _this = this;
            this.increaseCount = function () {
                _this.product.Count(new Number(_this.product.Count()).valueOf() + 1);
            };
            this.decreaseCount = function () {
                if (_this.product.Count() <= 1)
                    return;
                _this.product.Count(new Number(_this.product.Count()).valueOf() - 1);
            };
            this.close = function () {
                _this.panel.close();
            };
            this.select_property = function (item) {
                var selected_options = [];
                var selected_property_index;
                var properties = ko.unwrap(_this.product.CustomProperties);
                for (var i = 0; i < properties.length; i++) {
                    var p = properties[i];
                    var options = ko.unwrap(p.Options);
                    for (var j = 0; j < options.length; j++) {
                        if (options[j].Selected()) {
                            selected_options[i] = options[j];
                        }
                        if (options[j] == item) {
                            selected_property_index = i;
                        }
                    }
                }
                selected_options[selected_property_index] = item;
                var data = {};
                for (var i = 0; i < selected_options.length; i++) {
                    data['Value' + (i + 1)] = selected_options[i].Value();
                    data['Name' + (i + 1)] = properties[i].Name();
                }
                var groupId = ko.unwrap(_this.product.GroupId);
                shopping.getProductByNumberValues(groupId, data).done(function (data) {
                    if (data.Id == null) {
                        mapping.fromJS(data.CustomProperties, {}, _this.product.CustomProperties);
                    }
                    else {
                        mapping.fromJS(data, {}, _this.product);
                    }
                    var iscroll = _this.panel.page['iscroller'];
                    if (iscroll != null) {
                        window.setTimeout(function () { return iscroll.refresh(); }, 100);
                    }
                });
            };
            this.addToShoppingCart = function () {
                return _this.parent_model.addToShoppingCart().done(function () {
                    _this.panel.close();
                });
            };
            this.panel = panel;
            this.product = parent_model.product;
            this.parent_model = parent_model;
        }
        return ProductPanelModel;
    })();
    var ProductPanel = (function () {
        function ProductPanel(page, model) {
            var _this = this;
            this.ready = $.Deferred();
            this.is_ready = false;
            this.is_doing = false;
            this.confirmed = $.Callbacks();
            this.customProperties = ko.observableArray();
            this.html_loaded = function (html) {
                console.log('html_loaded');
                _this.node.innerHTML = html;
                _this.dialog_element = $(_this.node).find('.modal-dialog')[0];
                _this.dialog_element.style.width = _this.width + 'px';
                _this.is_ready = true;
                _this.ready.resolve();
                var m = new ProductPanelModel(_this, _this.page_model);
                ko.applyBindings(m, _this.node);
                var TOP_BAR_HEIGHT = 50;
                var BOTTOM_BAR_HEIGHT = 120;
                var $wrapper = $(_this.node).find('.modal-body');
                $wrapper.height($(window).height() - TOP_BAR_HEIGHT - BOTTOM_BAR_HEIGHT);
                var iscroll = new IScroll($wrapper[0], { tap: true });
                if (site.env.isIOS) {
                    var $input = $(_this.node).find('input[type="text"]');
                    $input.focus(function () {
                        console.log('input focus');
                        $(document).scrollTop(0);
                        $(document).scrollLeft(0);
                    });
                }
            };
            this.page_closed = function () {
                console.log('page_closed, remove node.');
                $(_this.node).remove();
            };
            this.open = function () {
                if (_this.is_doing)
                    return;
                _this.is_doing = true;
                var deferred = _this.is_ready ? $.Deferred().resolve() : _this.ready;
                deferred
                    .done(function () {
                    _this.node.style.display = 'block';
                    move(_this.dialog_element).x(_this.width).duration(0).end();
                    move(_this.dialog_element)
                        .x(0)
                        .duration(_this.show_time)
                        .end(function () {
                        _this.is_doing = false;
                    });
                })
                    .fail(function () {
                    _this.is_doing = false;
                });
            };
            this.close = function () {
                if (_this.is_doing)
                    return;
                _this.is_doing = true;
                move(_this.dialog_element)
                    .x(_this.width)
                    .duration(_this.show_time)
                    .end(function () {
                    _this.node.style.display = 'none';
                    _this.is_doing = false;
                });
            };
            this._page = page;
            this.page_model = model;
            this.width = $(window).width() * site.config.panelWithRate;
            this.node = document.createElement('div');
            this.node.style.display = 'none';
            document.body.appendChild(this.node);
            this._page.closed.add(this.page_closed);
            requirejs(['text!Module/Home/Product/ProductPanel.html'], this.html_loaded);
        }
        Object.defineProperty(ProductPanel.prototype, "page", {
            get: function () {
                return this._page;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductPanel.prototype, "show_time", {
            get: function () {
                var showTime = Math.floor(this.width / site.config.animationSpeed);
                return showTime;
            },
            enumerable: true,
            configurable: true
        });
        return ProductPanel;
    })();
    return ProductPanel;
});
