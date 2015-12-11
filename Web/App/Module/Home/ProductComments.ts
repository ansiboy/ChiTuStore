import shopping = require('Services/Shopping');

export = function (page: chitu.Page) {
    var model = {
        comments: ko.observableArray()
    }
    page.load.add(() => {
        return shopping.getProductComments(page.routeData.values().id, 10).done((comments) => {
            return model.comments(comments);
        });
    })

    page.viewChanged.add(() => ko.applyBindings(model, page.nodes().content));

} 