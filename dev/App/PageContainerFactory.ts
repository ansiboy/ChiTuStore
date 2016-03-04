
import shopping = require('Services/Shopping');
import auth = require('Services/Auth');

import site = require('Site');
import member = require('Services/Member');
import shoppingCart = require('Services/ShoppingCart');
import ko = require('knockout');


const DEFAULT_HEADER_PATH = 'UI/Headers/Default';
const DEFAULT_WITH_BACK = 'UI/Headers/DefaultWithBack';

function generateProductHeader(headerNode: HTMLElement, routeData: chitu.RouteData) {
    var model = {
        isFavored: ko.observable<boolean>(false),
        favor: () => {
            if (this.product == null)
                return;

            if (this.isFavored()) {
                shopping.unFavorProduct(ko.unwrap(this.product.Id));
                return;
            }

            shopping.favorProduct(ko.unwrap(this.product.Id), ko.unwrap(this.product.Name));
        }
    };

    var productId = routeData.values().id;
    auth.whenLogin(() => shopping.isFavored(productId).done((value) => model.isFavored(value)));

    ko.applyBindings(model, headerNode);
}

function createHeaderNode(container: chitu.PageContainer, header_path: string): JQueryPromise<HTMLElement> {
    var result = $.Deferred<HTMLElement>();

    var header_node: HTMLElement = document.createElement('header');
    container.element.appendChild(header_node);


    chitu.Utility.loadjs(['text!' + header_path + '.html', 'css!sc/Headers.css']).done(function(html) {
        header_node.innerHTML = html;
        result.resolve(header_node);
    });

    return result;
}

function setHeaderTitle(node: HTMLElement, title: string) {
    $(node).find('h4').html(title);
}

class PageContainerFactory {
    static createContainerHeader(routeData: chitu.RouteData, container: chitu.PageContainer) {


        var controller = routeData.values().controller;
        var action = routeData.values().action;
        var header_path = DEFAULT_HEADER_PATH;
        var header_title: JQueryPromise<string>;
        switch (controller) {
            case 'AccountSecurity':
                switch (action) {
                    case 'Index':
                        createHeaderNode(container, DEFAULT_WITH_BACK).done(function(node: HTMLElement) {
                            setHeaderTitle(node, '账户安全');
                        });
                        break;
                    case 'Setting':
                        var title: string;// = routeData.values().type == 'MobileBinding' ? '手机绑定' : '';
                        if (routeData.values().type == 'MobileBinding')
                            title = '手机绑定';
                        else if (routeData.values().type == 'LoginPassword')
                            title = '登录密码';
                        else if (routeData.values().type == 'PaymentPassword')
                            title = '支付密码';

                        createHeaderNode(container, DEFAULT_WITH_BACK).done(function(node: HTMLElement) {
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
                        createHeaderNode(container, DEFAULT_HEADER_PATH).done(function(node: HTMLElement) {
                            setHeaderTitle(node, '微资讯');
                        });
                        break;
                    case 'News':
                        createHeaderNode(container, DEFAULT_WITH_BACK).done(function(node: HTMLElement) {
                            setHeaderTitle(node, '资讯详情');
                        });
                        break;
                    case 'Product':
                        header_path = 'UI/Headers/Home_Product';
                        createHeaderNode(container, header_path).done(function(node) {
                            generateProductHeader(node, routeData);
                        });
                        break;
                    case 'ProductComments':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '产品评价'));
                        break;
                    case 'ProductDetail':
                        createHeaderNode(container, DEFAULT_WITH_BACK).done(function(node: HTMLElement) {
                            setHeaderTitle(node, '产品详情');
                        });
                        break;
                    case 'ProductList':
                        $.when(createHeaderNode(container, DEFAULT_WITH_BACK), shopping.getCategory(routeData.values().name))
                            .done(function(node: HTMLElement, category) {
                                setHeaderTitle(node, category.Name);
                            })
                        break;
                    case 'Search':
                        header_path = 'UI/Headers/Home_Search';
                        createHeaderNode(container, header_path).done(function(node) {
                            //generateProductHeader(node, routeData);
                        });
                        break;
                }
                break;
            case 'Shopping':
                switch (action) {
                    case 'OrderDetail':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '订单详情'));
                        break;
                    case 'OrderList':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '我的订单'));
                        break;
                    case 'ShoppingCart':
                        createHeaderNode(container, DEFAULT_HEADER_PATH)
                            .done((node) => setHeaderTitle(node, '购物车'))
                        break;
                }
                break;
            case 'User':
                switch (action) {
                    case 'Coupon':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '我的优惠券'));
                        break;
                    case 'Favors':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '我的收藏'));
                        break;
                    case 'Index':
                        createHeaderNode(container, DEFAULT_HEADER_PATH)
                            .done((node) => setHeaderTitle(node, '用户中心'));
                        break;
                    case 'Login':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '登录'))
                        break;
                    case 'Messages':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '我的消息'));
                        break;
                    case 'ScoreList':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '我的积分'));
                        break;
                    case 'ReceiptEdit':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '编辑地址'));
                        break;
                    case 'ReceiptList':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '收货地址'));
                        break;
                    case 'RechargeList':
                        createHeaderNode(container, DEFAULT_WITH_BACK)
                            .done((node) => setHeaderTitle(node, '充值记录'));
                        break;
                }
                break;
            case 'Error':
                createHeaderNode(container, DEFAULT_WITH_BACK)
                    .done(function(node) {
                        setHeaderTitle(node, '网络错误');
                    });
                break;
        }
        // if (header_path) {
        //     requirejs(['text!' + header_path + '.html', 'css!sc/Headers.css'], function(html) {
        //         header_node.innerHTML = html;
        //         if (header_title) {
        //             header_title.done(function(title) {
        //                 $(header_node).find('h4').html(title);
        //             });
        //         }
        //     });
        // }
    }
    static createContainerFooter(routeData: chitu.RouteData, container: chitu.PageContainer) {
        var controller = routeData.values().controller;
        var action = routeData.values().action;
        if ((controller == 'Home' && action == 'Index') || (controller == 'Home' && action == 'Class') ||
            (controller == 'Home' && action == 'NewsList') || (controller == 'User' && action == 'Index') ||
            (controller == 'Shopping' && action == 'ShoppingCart')) {
            new Menu(container.element, routeData);
        }

    }
    static createInstance(app: chitu.Application, routeData: chitu.RouteData, previous: chitu.PageContainer): chitu.PageContainer {
        var c: chitu.PageContainer = chitu.PageContainerFactory.createInstance(app, routeData, previous);
        $(c.element).addClass(routeData.values().controller + '-' + routeData.values().action);
        PageContainerFactory.createContainerHeader(routeData, c);
        PageContainerFactory.createContainerFooter(routeData, c);

        //if (site.env.isApp && site.env.isIOS)
        $(c.element).addClass('immersion');

        return c;
    }


}

export = PageContainerFactory;

var menu_html: string;
class Menu {
    private node: HTMLElement;

    constructor(parentNode: HTMLElement, routeData: chitu.RouteData) {
        this.node = document.createElement('div');
        parentNode.appendChild(this.node);

        var updateProductsCount = () => {
            var $products_count = $(this.node).find('[name="products-count"]');
            if (shoppingCart.info.itemsCount() == 0) {
                $products_count.hide();
            }
            else {
                $products_count.show();
            }
            $products_count.text(shoppingCart.info.itemsCount());
        }
        shoppingCart.info.itemsCount.subscribe(updateProductsCount);

        this.loadHTML().done((html) => {
            this.node.innerHTML = html;
            var args = routeData.values();
            var $tab = $(this.node).find('[name="' + args.controller + '_' + args.action + '"]');
            if ($tab.length > 0) {
                $tab.addClass('active');
            }
            updateProductsCount();
        });
    }

    private loadHTML(): JQueryPromise<string> {
        if (menu_html)
            return $.Deferred<string>().resolve(menu_html);

        var deferred = $.Deferred<string>();
        requirejs(['text!UI/Menu.html'], function(html) {
            menu_html = html;
            deferred.resolve(html);
        });

        return deferred;
    }
}