/// <reference path="../../../Scripts/typings/knockout.d.ts"/>
/// <reference path="../../../Scripts/typings/knockout.mapping.d.ts"/>

import info = require('Services/Info');
import site = require('Site');
import app = require('Application');
import mapping = require('knockout.mapping');

requirejs(['css!content/Home/News']);
export = function(page: chitu.Page) {
    var model = {
        news: null,
        back: function() {
            app.back().fail(function() {
                app.redirect('Home_NewsList');
            });
        },
        category: ko.observable()
    };

    var id = page.routeData.values().id;
    var result = info.getArticleById(id).done(function(news) {
        if (model.news == null) {
            model.news = mapping.fromJS(news);
            ko.applyBindings(model, page.element);
        }
        else {
            mapping.fromJS(news, {}, model.news);
        }
    });

    page.viewChanged.add(() => page.findControl('news').load.add(() => result));
    

    //===========================================
    // 由于个别文章的图片，没有按指定的名称命名，不能预设大小
    // if (page.conatiner instanceof chitu.IScrollPageContainer) {
    //     page.scrollEnd.add(() => {
    //         page.refreshUI();
    //     });
    // }
    //===========================================
}
