var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Site', 'Services/Station'], function (require, exports, site, station) {
    requirejs(['css!content/Home/Search']);
    var Status;
    (function (Status) {
        Status[Status["ready"] = 0] = "ready";
        Status[Status["searching"] = 1] = "searching";
        Status[Status["complete"] = 2] = "complete";
    })(Status || (Status = {}));
    var page_index = 0;
    var Model = (function () {
        function Model() {
            var _this = this;
            this.status = ko.observable(Status.ready);
            this.isReady = ko.computed(function () { return _this.status() == Status.ready; });
            this.isSearching = ko.computed(function () { return _this.status() == Status.searching; });
            this.isComplete = ko.computed(function () { return _this.status() == Status.complete; });
            this.searchText = ko.observable();
            this.products = ko.observableArray();
            this.hotKeywords = ko.observableArray();
            this.historyKeywords = ko.observableArray();
            this.selectKeyworkd = function (keyword) {
                _this.searchText(keyword);
                _this.search();
            };
            this.search = function () {
                var searchText = _this.searchText();
                var result;
                if (!searchText) {
                    result = $.Deferred();
                    result['loadCompleted'] = true;
                    result.resolve();
                }
                else {
                    _this.status(Status.searching);
                    result = station.searchProducts(searchText, page_index)
                        .done(function (data) {
                        _this.products(data);
                        _this.status(Status.complete);
                        var keywords = new Array();
                        var historyKeywords = _this.historyKeywords();
                        for (var i = 0; i < historyKeywords.length; i++) {
                            if (historyKeywords[i] == searchText)
                                continue;
                            keywords.push(historyKeywords[i]);
                        }
                        keywords.unshift(searchText);
                        _this.historyKeywords(keywords);
                        site.storage.historyKeywords = keywords;
                    });
                }
                return result;
            };
            this.clearHistoryKeywords = function () {
                site.storage.historyKeywords = [];
                _this.historyKeywords([]);
            };
            this.searchText.subscribe(function () { return page_index = 0; });
            this.searchText.subscribe(function (value) {
                if (!_this.searchText())
                    _this.status(Status.ready);
            });
        }
        return Model;
    })();
    return (function (_super) {
        __extends(SearchPage, _super);
        function SearchPage(html) {
            var _this = this;
            _super.call(this, html);
            this.model = new Model();
            this.load.add(this.page_load);
            station.hotKeywords().done(function (data) {
                _this.model.hotKeywords(data);
            });
        }
        SearchPage.prototype.page_load = function (sender, args) {
            ko.applyBindings(sender.model, sender.element);
            var data = site.storage.get_item('historyKeyword');
            sender.model.historyKeywords(site.storage.historyKeywords);
            return sender.model.search();
        };
        return SearchPage;
    })(chitu.Page);
});
