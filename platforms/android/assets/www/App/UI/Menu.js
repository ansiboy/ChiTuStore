/// <reference path='../../Scripts/typings/require.d.ts'/>
/// <reference path='../../Scripts/typings/knockout.d.ts'/>
define(["require", "exports", 'Services/ShoppingCart'], function (require, exports, shoppingCart) {
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
});
