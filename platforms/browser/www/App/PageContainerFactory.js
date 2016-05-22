define(["require", "exports", 'chitu', 'Services/Shopping', 'Services/Auth', 'Services/ShoppingCart', 'knockout'], function (require, exports, chitu, shopping, auth, shoppingCart, ko) {
    var DEFAULT_HEADER_PATH = 'UI/Headers/Default';
    var DEFAULT_WITH_BACK = 'UI/Headers/DefaultWithBack';
    function generateProductHeader(headerNode, routeData) {
        var _this = this;
        var model = {
            isFavored: ko.observable(false),
            favor: function () {
                if (_this.product == null)
                    return;
                if (_this.isFavored()) {
                    shopping.unFavorProduct(ko.unwrap(_this.product.Id));
                    return;
                }
                shopping.favorProduct(ko.unwrap(_this.product.Id), ko.unwrap(_this.product.Name));
            }
        };
        var productId = routeData.values.id;
        auth.whenLogin(function () { return shopping.isFavored(productId).done(function (value) { return model.isFavored(value); }); });
        ko.applyBindings(model, headerNode);
    }
    function createHeaderNode(container, header_path) {
        var result = $.Deferred();
        var header_node = document.createElement('header');
        container.element.appendChild(header_node);
        chitu.Utility.loadjs(['text!' + header_path + '.html', 'css!sc/Headers.css']).done(function (html) {
            header_node.innerHTML = html;
            result.resolve(header_node);
        });
        return result;
    }
    function setHeaderTitle(node, title) {
        $(node).find('h4').html(title);
    }
    var PageContainerFactory = (function () {
        function PageContainerFactory() {
        }
        PageContainerFactory.createContainerHeader = function (routeData, container) {
            var controller = routeData.values.controller;
            var action = routeData.values.action;
            var header_path = DEFAULT_HEADER_PATH;
            var header_title;
            switch (controller) {
                case 'AccountSecurity':
                    switch (action) {
                        case 'Index':
                            createHeaderNode(container, DEFAULT_WITH_BACK).done(function (node) {
                                setHeaderTitle(node, '账户安全');
                            });
                            break;
                        case 'Setting':
                            var title;
                            if (routeData.values.type == 'MobileBinding')
                                title = '手机绑定';
                            else if (routeData.values.type == 'LoginPassword')
                                title = '登录密码';
                            else if (routeData.values.type == 'PaymentPassword')
                                title = '支付密码';
                            createHeaderNode(container, DEFAULT_WITH_BACK).done(function (node) {
                                setHeaderTitle(node, title);
                            });
                            break;
                    }
                    break;
                case 'Home':
                    switch (action) {
                        case 'Index':
                            header_path = 'UI/Headers/Home_Index';
                            createHeaderNode(container, header_path);
                            break;
                        case 'Class':
                            header_path = 'UI/Headers/Home_Class';
                            createHeaderNode(container, header_path);
                            break;
                        case 'NewsList':
                            createHeaderNode(container, DEFAULT_HEADER_PATH).done(function (node) {
                                setHeaderTitle(node, '微资讯');
                            });
                            break;
                        case 'News':
                            createHeaderNode(container, DEFAULT_WITH_BACK).done(function (node) {
                                setHeaderTitle(node, '资讯详情');
                            });
                            break;
                        case 'Product':
                            header_path = 'UI/Headers/Home_Product';
                            createHeaderNode(container, header_path).done(function (node) {
                                generateProductHeader(node, routeData);
                            });
                            break;
                        case 'ProductComments':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '产品评价'); });
                            break;
                        case 'ProductDetail':
                            createHeaderNode(container, DEFAULT_WITH_BACK).done(function (node) {
                                setHeaderTitle(node, '产品详情');
                            });
                            break;
                        case 'ProductList':
                            $.when(createHeaderNode(container, DEFAULT_WITH_BACK), shopping.getCategory(routeData.values.id))
                                .done(function (node, category) {
                                setHeaderTitle(node, category.Name);
                            });
                            break;
                        case 'Search':
                            header_path = 'UI/Headers/Home_Search';
                            createHeaderNode(container, header_path).done(function (node) {
                            });
                            break;
                    }
                    break;
                case 'Shopping':
                    switch (action) {
                        case 'OrderDetail':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '订单详情'); });
                            break;
                        case 'OrderList':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '我的订单'); });
                            break;
                        case 'ShoppingCart':
                            createHeaderNode(container, DEFAULT_HEADER_PATH)
                                .done(function (node) { return setHeaderTitle(node, '购物车'); });
                            break;
                    }
                    break;
                case 'User':
                    switch (action) {
                        case 'Coupon':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '我的优惠券'); });
                            break;
                        case 'Favors':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '我的收藏'); });
                            break;
                        case 'Index':
                            createHeaderNode(container, DEFAULT_HEADER_PATH)
                                .done(function (node) { return setHeaderTitle(node, '用户中心'); });
                            break;
                        case 'Login':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '登录'); });
                            break;
                        case 'Messages':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '我的消息'); });
                            break;
                        case 'ScoreList':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '我的积分'); });
                            break;
                        case 'ReceiptEdit':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '编辑地址'); });
                            break;
                        case 'ReceiptList':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '收货地址'); });
                            break;
                        case 'Recharge':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '充值'); });
                            break;
                        case 'RechargeList':
                            createHeaderNode(container, 'UI/Headers/RechargeList')
                                .done(function (node) { return setHeaderTitle(node, '充值记录'); });
                            break;
                        case 'UserInfoItemEdit':
                            var title = "&nbsp;";
                            switch (routeData.values.field) {
                                case 'Region':
                                    title = '地区';
                                    break;
                            }
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, title); });
                            break;
                        case 'UserInfo':
                            createHeaderNode(container, DEFAULT_WITH_BACK)
                                .done(function (node) { return setHeaderTitle(node, '用户信息'); });
                            break;
                    }
                    break;
                case 'Error':
                    createHeaderNode(container, DEFAULT_WITH_BACK)
                        .done(function (node) {
                        setHeaderTitle(node, '网络错误');
                    });
                    break;
            }
        };
        PageContainerFactory.createContainerFooter = function (routeData, container) {
            var controller = routeData.values.controller;
            var action = routeData.values.action;
            if ((controller == 'Home' && action == 'Index') || (controller == 'Home' && action == 'Class') ||
                (controller == 'Home' && action == 'NewsList') || (controller == 'User' && action == 'Index') ||
                (controller == 'Shopping' && action == 'ShoppingCart')) {
                new Menu(container.element, routeData);
            }
        };
        PageContainerFactory.createInstance = function (app, routeData, previous) {
            var c = chitu.PageContainerFactory.createInstance(app, routeData, previous);
            $(c.element).addClass(routeData.values.controller + '-' + routeData.values.action);
            PageContainerFactory.createContainerHeader(routeData, c);
            PageContainerFactory.createContainerFooter(routeData, c);
            $(c.element).addClass('immersion');
            return c;
        };
        return PageContainerFactory;
    })();
    var menu_html;
    var Menu = (function () {
        function Menu(parentNode, routeData) {
            var _this = this;
            this.node = document.createElement('div');
            parentNode.appendChild(this.node);
            var updateProductsCount = function () {
                var $products_count = $(_this.node).find('[name="products-count"]');
                if (shoppingCart.info.itemsCount() == 0) {
                    $products_count.hide();
                }
                else {
                    $products_count.show();
                }
                $products_count.text(shoppingCart.info.itemsCount());
            };
            shoppingCart.info.itemsCount.subscribe(updateProductsCount);
            this.loadHTML().done(function (html) {
                _this.node.innerHTML = html;
                var args = routeData.values;
                var $tab = $(_this.node).find('[name="' + args.controller + '_' + args.action + '"]');
                if ($tab.length > 0) {
                    $tab.addClass('active');
                }
                updateProductsCount();
            });
        }
        Menu.prototype.loadHTML = function () {
            if (menu_html)
                return $.Deferred().resolve(menu_html);
            var deferred = $.Deferred();
            requirejs(['text!UI/Menu.html'], function (html) {
                menu_html = html;
                deferred.resolve(html);
            });
            return deferred;
        };
        return Menu;
    })();
    return PageContainerFactory;
});
