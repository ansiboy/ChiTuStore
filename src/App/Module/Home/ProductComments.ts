import chitu = require('chitu');
import shopping = require('Services/Shopping');

class ProductCommentsPage extends chitu.Page {
    private model = {
        comments: ko.observableArray()
    }
    constructor(html) {
        super(html);
        this.load.add(this.page_load);
    }

    private page_load(sender: ProductCommentsPage, args) {
        ko.applyBindings(sender.model, sender.element)
        return shopping.getProductComments(args.id, 10).done((comments) => {
            return sender.model.comments(comments);
        });
    }

}

export =ProductCommentsPage;

