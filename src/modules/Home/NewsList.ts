import services = require('services/Service');
import info = require('services/Info');
import site = require('Site');
import chitu = require('chitu');
import ScrollBottomLoad = require('core/ScrollBottomLoad');

class NewsListPage extends chitu.Page {
    private select_args = { categoryName: '', pageIndex: 0 };
    private scroll_end = false;
    private scrollBottomLoad: ScrollBottomLoad;

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
        let view = <chitu.ScrollView>page.findControl('news');
        this.scrollBottomLoad = new ScrollBottomLoad(view, (s, a) => this.scrollView_load(s, a));
        return this.scrollView_load(view, {});
    }

    private scrollView_load(sender: chitu.ScrollView, args) {
        let page = <NewsListPage>sender.page;
        return info.getArticles(page.select_args).done(function (items) {
            for (var i = 0; i < items.length; i++) {
                page.model.articles.push(items[i]);
            }
            page.select_args.pageIndex = page.select_args.pageIndex + 1;
            page.scrollBottomLoad.enableScrollLoad = items.length == services.defaultPageSize;
        });
    }
}

export = NewsListPage;