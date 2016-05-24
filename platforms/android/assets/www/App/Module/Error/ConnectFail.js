var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'chitu', 'Site'], function (require, exports, chitu, site) {
    requirejs(['css!sc/Error/ConnectFail']);
    var Model = (function () {
        function Model(page) {
            this.redirectUrl = ko.observable();
        }
        Model.prototype.redirec = function (model) {
            var url = model.redirectUrl();
            if (!url)
                url = site.config.defaultUrl;
            location.hash = '#' + url;
        };
        return Model;
    })();
    var ConnectFailPage = (function (_super) {
        __extends(ConnectFailPage, _super);
        function ConnectFailPage(html) {
            _super.call(this, html);
            this.model = new Model(this);
            this.load.add(this.page_load);
        }
        ConnectFailPage.prototype.page_load = function (sender, args) {
            sender.model.redirectUrl(location.hash.substr(1));
            ko.applyBindings(sender.model, sender.element);
        };
        return ConnectFailPage;
    })(chitu.Page);
    return ConnectFailPage;
});
