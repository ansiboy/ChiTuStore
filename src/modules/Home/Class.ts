import chitu = require('chitu');
import shopping = require('services/Shopping');

export = class ClassPage extends chitu.Page {
    private model = {
        categories: ko.observableArray(),
    }

    constructor(html) {
        super(html);
        this.load.add(this.page_load);
    }

    private page_load(sender: ClassPage, args) {
        ko.applyBindings(sender.model, sender.element);
        return shopping.getCategories().done((items) => sender.model.categories(items));
    }
}


