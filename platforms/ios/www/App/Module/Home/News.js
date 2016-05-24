var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Info', 'Application', 'knockout.mapping'], function (require, exports, info, app, mapping) {
    var NewsPage = (function (_super) {
        __extends(NewsPage, _super);
        function NewsPage(html) {
            _super.call(this, html);
            this.model = {
                news: null,
                back: function () {
                    app.back().fail(function () {
                        app.redirect('Home_NewsList');
                    });
                },
                category: ko.observable()
            };
            this.load.add(this.page_load);
        }
        NewsPage.prototype.page_load = function (sender, args) {
            return info.getArticleById(args.id).done(function (news) {
                sender.model.news = mapping.fromJS(news);
                ko.applyBindings(sender.model, sender.element);
            });
        };
        return NewsPage;
    })(chitu.Page);
    return NewsPage;
});
