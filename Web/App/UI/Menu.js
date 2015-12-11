define(["require", "exports", 'Application'], function (require, exports, app) {
    var menu_html;
    var Menu = (function () {
        function Menu(page) {
            var _this = this;
            this.node = document.createElement('div');
            page.nodes().footer.appendChild(this.node);
            this.loadHTML().done(function (html) {
                _this.node.innerHTML = html;
                var args = page.routeData.values();
                var $tab = $(_this.node).find('[name="' + args.controller + '_' + args.action + '"]');
                if ($tab.length > 0) {
                    $tab.addClass('active');
                }
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
    function page_created(sender, page) {
        if (page.name == 'Home.Index' || page.name == 'Home.Class' || page.name == 'Shopping.ShoppingCart' ||
            page.name == 'Home.NewsList' || page.name == 'User.Index')
            page['menu'] = new Menu(page);
    }
    app.pageCreated.add(page_created);
    if (app.currentPage())
        page_created(app, app.currentPage());
});
