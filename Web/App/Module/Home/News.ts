import info = require('Services/Info');
//import chitu = require('chitu');
import app = require('Application');
import mapping = require('knockout.mapping');
//import c = require('ui/ScrollLoad');
requirejs(['css!content/Home/News']);

export = function (page: chitu.Page) {
    /// <param name="page" type="chitu.Page"/>

    //c.scrollLoad(page, { recordPosition: false });

    var model = {
        news: null,
        back: function () {
            app.back().fail(function () {
                app.redirect('Home_NewsList');
            });
        },
        category: ko.observable()
    };

    page.load.add(function (sender, args) {
        //page.key(args.id);

        var id = args.id;
        return info.getArticleById(id).done(function (news) {
            //alert('load');
            if (model.news == null) {
                model.news = mapping.fromJS(news);
                ko.applyBindings(model, page.nodes().content);
            }
            else {
                mapping.fromJS(news, {}, model.news);
            }
        });
    });

    page.scrollEnd.add(() => {
        page.refreshUI();
    });
}
//});