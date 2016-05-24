import info = require('Services/Info');
import site = require('Site');
import chitu = require('chitu');

requirejs(['css!content/Home/NewsList']);

class NewsListPage extends chitu.Page {
    private select_args = { categoryName: '', pageIndex: 0 };
    private scroll_end = false;

    private model = {
        articles: ko.observableArray(),
        currentCategory: ko.observable(),
    };
    
    constructor(html) {
        super(html);
        this.load.add(this.page_load);
    }

    private page_load(page: NewsListPage, args: any) {
        ko.applyBindings(page.model, page.element);

        (<chitu.ScrollView>page.findControl('news')).scrollLoad = (function (sender: chitu.ScrollView, args) {
            return info.getArticles(page.select_args).done(function (items) {
                for (var i = 0; i < items.length; i++) {
                    page.model.articles.push(items[i]);
                }
                page.select_args.pageIndex = page.select_args.pageIndex + 1;
                args.enableScrollLoad = items.length == site.config.pageSize;
            });
        })
    }
}

export = NewsListPage;