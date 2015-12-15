import app = require('Application');
import site = require('Site');
import member = require('Services/Member');
import shoppingCart = require('Services/ShoppingCart');
import ko = require('knockout');

//var services = { member: member, shoppingCart: shoppingCart };

var menu_html: string;
class Menu {
    private node: HTMLElement;

    constructor(page: chitu.Page) {
        this.node = document.createElement('div');
        page.nodes().footer.appendChild(this.node);

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
            var args = page.routeData.values();
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
        requirejs(['text!UI/Menu.html'], function (html) {
            menu_html = html;
            deferred.resolve(html);
        });

        return deferred;
    }
}

function page_created(sender, page: chitu.Page) {
    if (page.name == 'Home.Index' || page.name == 'Home.Class' || page.name == 'Shopping.ShoppingCart' ||
        page.name == 'Home.NewsList' || page.name == 'User.Index')
        page['menu'] = new Menu(page);
}
app.pageCreated.add(page_created);

if (app.currentPage())
    page_created(app, app.currentPage());





