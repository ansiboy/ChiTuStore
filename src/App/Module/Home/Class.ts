import chitu = require('chitu');
import shopping = require('Services/Shopping');

chitu.Utility.loadjs(['css!content/Home/Class']);

class ClassPage extends chitu.Page {
    private model = {
        categories: ko.observableArray(),
    }

    constructor() {
        super();
        this.load.add(this.page_load);
    }

    private page_load(sender: ClassPage, args) {
        ko.applyBindings(sender.model, sender.element);
        return shopping.getCategories().done(function (items) {
            for (var i = 0; i < items.length; i++) {
                if (!items[i].ImagePath) {
                    items[i].ImagePath = 'content/images/icon_01.png';
                }
            }
            sender.model.categories(items);
        });
    }
}

export = ClassPage;


