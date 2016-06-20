import app = require('Application');
import site = require('Site');
import member = require('services/Member');
import shoppingCart = require('services/ShoppingCart');
import ko = require('knockout');

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
            var args = routeData.values;
            var $tab = $(this.node).find('[name="' + args.controller + '_' + args.action + '"]'); //$(document.getElementById(args.controller + '_' + args.action))
            if ($tab.length > 0) {
                //$menu.find('a').removeClass('active');
                $tab.addClass('active');
            }
            updateProductsCount();

            //ko.applyBindings(model, this.node);
        });


    }

    private loadHTML(): JQueryPromise<string> {
        if (menu_html)
            return $.Deferred<string>().resolve(menu_html);

        var deferred = $.Deferred<string>();
        requirejs(['text!ui/Menu.html'], function(html) {
            menu_html = html;
            deferred.resolve(html);
        });

        return deferred;
    }
}






