define(["require", "exports", 'Application', 'Services/Shopping', 'Services/ShoppingCart', 'knockout.mapping', 'Module/Home/Product/ProductPanel', 'Module/Home/Product/ProductDetailPanel', 'Services/Auth'], function (require, exports, app, shopping, shoppingCart, mapping, ProductPanel, ProductDetailPanel, auth) {
    var services = window['services'];
    requirejs(['css!content/Home/Product'], function () { });
    var ProductModel = (function () {
        function ProductModel(page) {
            var _this = this;
            this.comments = ko.observableArray();
            this.shoppingCartNumber = shoppingCart.info.itemsCount;
            this.isFavored = ko.observable(false);
            this.addToShoppingCart = function () {
                var product = _this['product'];
                return shoppingCart.addItem(product, product.Count()).done(function () {
                    var shopping_cart_page = app.getCachePage('Shopping.ShoppingCart');
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
        page.view = $.when(viewDeferred, chitu.Utility.loadjs(['ui/Promotion']));
        var model = new ProductModel(page);
        page.load.add(function (sender, args) {
            var productId = args.id;
            auth.whenLogin(function () { return shopping.isFavored(productId).done(function (value) { return model.isFavored(value); }); });
            return $.when(shopping.getProduct(productId), services.shopping.getProductStock(productId), shopping.getProductComments(args.id, 4))
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
            });
        });
        page.viewChanged.add(function () {
            $(page.nodes().header).find('.topbar').first().remove();
            requirejs(['swiper'], function (Swiper) {
                var mySwiper = new Swiper($(page.node()).find('[name="productImages"]')[0], {
                    pagination: $(page.node()).find('[name="productImages-pagination"]')[0],
                    onTap: function (swiper, event) {
                    }
                });
            });
        });
        page.loadCompleted.add(function () { return ko.applyBindings(model, page.nodes().container); });
    };
});
