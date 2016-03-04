define(["require", "exports", 'Application', 'Services/Shopping', 'Services/ShoppingCart', 'knockout.mapping', 'Module/Home/Product/ProductPanel', 'Module/Home/Product/ProductDetailPanel', 'Services/Auth'], function (require, exports, app, shopping, shoppingCart, mapping, ProductPanel, ProductDetailPanel, auth) {
    var services = window['services'];
    var ProductModel = (function () {
        function ProductModel(page) {
            var _this = this;
            this.comments = ko.observableArray();
            this.shoppingCartNumber = shoppingCart.info.itemsCount;
            this.isFavored = ko.observable(false);
            this.addToShoppingCart = function () {
                var product = _this['product'];
                return shoppingCart.addItem(product, product.Count()).done(function () {
                    var shopping_cart_page = app.getPage('Shopping.ShoppingCart');
                    if (shopping_cart_page)
                        shopping_cart_page.on_load({});
                });
            };
            this.back = function () {
                app.back().fail(function () {
                    app.redirect('Home_ProductList_category_' + ko.unwrap(_this['product'].ProductCategoryId));
                });
            };
            this.showPanel = function () {
                console.log('showPanel');
                _this.panel.open();
            };
            this.favor = function () {
                if (_this.product == null)
                    return;
                if (_this.isFavored()) {
                    shopping.unFavorProduct(ko.unwrap(_this.product.Id));
                    return;
                }
                shopping.favorProduct(ko.unwrap(_this.product.Id), ko.unwrap(_this.product.Name));
            };
            this.page = page;
        }
        Object.defineProperty(ProductModel.prototype, "panel", {
            get: function () {
                if (this._optionPanel == null)
                    this._optionPanel = new ProductPanel(this.page, this);
                return this._optionPanel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductModel.prototype, "detailPanel", {
            get: function () {
                if (this._detailPanel == null) {
                    this._detailPanel = new ProductDetailPanel(this.page);
                }
                return this._detailPanel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductModel.prototype, "product", {
            get: function () {
                return this._product;
            },
            set: function (value) {
                this._product = value;
            },
            enumerable: true,
            configurable: true
        });
        return ProductModel;
    })();
    return function (page) {
        var viewDeferred = page.view;
        page.view = $.when(viewDeferred, chitu.Utility.loadjs(['css!content/Home/Product', 'UI/Promotion']));
        var productId = page.routeData.values().id;
        auth.whenLogin(function () { return shopping.isFavored(productId).done(function (value) { return model.isFavored(value); }); });
        var model = new ProductModel(page);
        var result = $.when(shopping.getProduct(productId), services.shopping.getProductStock(productId), shopping.getProductComments(page.routeData.values().id, 4), chitu.Utility.loadjs([]))
            .done(function (product, stock, comments) {
            product.Stock = stock.Quantity != null ? stock.Quantity : 1000000;
            model.comments(comments);
            model.product = mapping.fromJS(product);
            model.product.Count = ko.observable(1);
            model.product.SelectedText = ko.computed(function () {
                var str = '';
                var props = mapping.toJS(this.CustomProperties);
                for (var i = 0; i < props.length; i++) {
                    var options = props[i].Options;
                    for (var j = 0; j < options.length; j++) {
                        if (options[j].Selected) {
                            str = str + options[j].Name + ' ';
                            break;
                        }
                    }
                }
                str = str + this.Count() + '件';
                return str;
            }, model.product);
            ko.applyBindings(model, page.node);
        });
        function on_load(sender, args) {
            return result;
        }
        page.viewChanged.add(function () {
            var scroll_view = page.findControl('product');
            scroll_view.load.add(on_load);
            scroll_view.scroll.add(function () { return console.log('scroll'); });
            var container_width = $(page.container.element).width();
            var $active_item;
            var $next_item;
            var $prev_item;
            var active_item_pos = 0;
            var next_item_pos = container_width;
            var prev_item_pos = 0 - container_width;
            var pan = page.container.gesture.createPan(page.container.element);
            pan.start = function (e) {
                console.log('start');
                $active_item = $(page.node).find('scroll-view.active');
                if ($active_item.length == 0 || chitu.ScrollView.scrolling) {
                    return false;
                }
                $next_item = $active_item.next('scroll-view');
                $prev_item = $active_item.prev('scroll-view');
                var index = $(page.node).find('scroll-view').index($active_item);
                var started = (index == 0 && (e.direction & Hammer.DIRECTION_LEFT) == Hammer.DIRECTION_LEFT) || (index == 1) ||
                    (index == 2 && (e.direction & Hammer.DIRECTION_RIGHT) == Hammer.DIRECTION_RIGHT);
                return started;
            };
            pan.left = function (e) {
                move($active_item[0]).x(active_item_pos + e.deltaX).duration(0).end();
                if ($next_item.length > 0)
                    move($next_item[0]).x(next_item_pos + e.deltaX).duration(0).end();
                if ($prev_item.length > 0)
                    move($prev_item[0]).x(prev_item_pos + e.deltaX).duration(0).end();
            };
            pan.right = function (e) {
                move($active_item[0]).x(active_item_pos + e.deltaX).duration(0).end();
                if ($next_item.length > 0)
                    move($next_item[0]).x(next_item_pos + e.deltaX).duration(0).end();
                if ($prev_item.length > 0)
                    move($prev_item[0]).x(prev_item_pos + e.deltaX).duration(0).end();
                page.container.gesture.prevent.pan(Hammer.DIRECTION_RIGHT);
            };
            pan.end = function (e) {
                console.log('end');
                if (Math.abs(e.deltaX) / container_width < 0.5) {
                    move($active_item[0]).x(active_item_pos).end();
                    if ($next_item.length > 0)
                        move($next_item[0]).x(next_item_pos).end();
                    if ($prev_item.length > 0)
                        move($prev_item[0]).x(prev_item_pos).end();
                    return;
                }
                if (e.deltaX < 0 && $next_item.length > 0) {
                    move($active_item[0]).x(prev_item_pos).end();
                    move($next_item[0]).x(active_item_pos).end();
                    $next_item.addClass('active');
                    $active_item.removeClass('active');
                }
                else if (e.deltaX > 0 && $prev_item.length > 0) {
                    move($active_item[0]).x(next_item_pos).end();
                    move($prev_item[0]).x(active_item_pos).end();
                    $prev_item.addClass('active');
                    $active_item.removeClass('active');
                }
                $active_item = $(page.node).find('scroll-view.active');
                $next_item = $active_item.next('scroll-view');
                $prev_item = $active_item.prev('scroll-view');
            };
        });
    };
});
