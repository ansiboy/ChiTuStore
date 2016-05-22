var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Info', 'Site', 'chitu'], function (require, exports, info, site, chitu) {
    requirejs(['css!content/Home/NewsList']);
    var NewsListPage = (function (_super) {
        __extends(NewsListPage, _super);
        function NewsListPage() {
            _super.call(this);
            this.select_args = { categoryName: '', pageIndex: 0 };
            this.scroll_end = false;
            this.model = {
                articles: ko.observableArray(),
                currentCategory: ko.observable(),
            };
            this.load.add(this.page_load);
        }
        NewsListPage.prototype.page_load = function (page, args) {
            ko.applyBindings(page.model, page.element);
            page.findControl('news').scrollLoad = (function (sender, args) {
                return info.getArticles(page.select_args).done(function (items) {
                    for (var i = 0; i < items.length; i++) {
                        page.model.articles.push(items[i]);
                    }
                    page.select_args.pageIndex = page.select_args.pageIndex + 1;
                    args.enableScrollLoad = items.length == site.config.pageSize;
                });
            });
        };
        return NewsListPage;
    })(chitu.Page);
    return NewsListPage;
});
