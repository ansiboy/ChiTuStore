

import info = require('Services/Info');
import site = require('Site');
import app = require('Application');
import mapping = require('knockout.mapping');

requirejs(['css!content/Home/News']);
class NewsPage extends chitu.Page {
    private model = {
        news: null,
        back: function () {
            app.back().fail(function () {
                app.redirect('Home_NewsList');
            });
        },
        category: ko.observable()
    };

    constructor() {
        super();
        this.load.add(this.page_load);
    }

    private page_load(sender: NewsPage, args) {
        return info.getArticleById(args.id).done(function (news) {
            sender.model.news = mapping.fromJS(news);
            ko.applyBindings(sender.model, sender.element);
        });
    }
}

export = NewsPage;
