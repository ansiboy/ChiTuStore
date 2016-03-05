import info = require('Services/Info');
import site = require('Site');

requirejs(['css!content/Home/NewsList']);

export = function(page: chitu.Page) {


    var select_args = { categoryName: '', pageIndex: 0 };
    var scroll_end = false;

    var model = {
        articles: ko.observableArray(),
        currentCategory: ko.observable(),
    };



    page.viewChanged.add(() => {
        ko.applyBindings(model, page.element);
        (<chitu.ScrollView>page.findControl('news')).scrollLoad = (function(sender: chitu.Page, args) {
            return info.getArticles(select_args).done(function(items) {
                for (var i = 0; i < items.length; i++) {
                    model.articles.push(items[i]);
                }
                select_args.pageIndex = select_args.pageIndex + 1;
                args.enableScrollLoad = items.length == site.config.pageSize;
            });
        })
    });

} 