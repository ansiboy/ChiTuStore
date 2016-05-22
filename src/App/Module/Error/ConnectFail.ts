import TopBar = require('UI/TopBar');
import app = require('Application');
import chitu = require('chitu');
import site = require('Site');

requirejs(['css!sc/Error/ConnectFail']);

class Model {
    public redirectUrl: KnockoutObservable<string>;

    constructor(page: ConnectFailPage) {
        this.redirectUrl = ko.observable<string>();
    }

    public redirec() {
        var url = this.redirectUrl();
        if (!url)
            url = site.config.defaultUrl;

        location.hash = '#' + url;
    }
}

class ConnectFailPage extends chitu.Page {
    private model: Model;
    constructor() {
        super();
        this.model = new Model(this);
        this.load.add(this.page_load);
    }

    private page_load(sender: ConnectFailPage, args: any) {
        sender.model.redirectUrl(location.hash.substr(1));
        ko.applyBindings(sender.model, sender.element);
    }
}

export = ConnectFailPage;