/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/chitu.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />

import site = require('Site');
import station = require('Services/Station');


requirejs(['css!content/Home/Search']);

enum Status {
    ready,
    searching,
    complete
}

var page_index = 0;
class Model {
    status = ko.observable(Status.ready)
    isReady = ko.computed<boolean>(() => this.status() == Status.ready)
    isSearching = ko.computed(() => this.status() == Status.searching)
    isComplete = ko.computed(() => this.status() == Status.complete)
    searchText: KnockoutObservable<string> = ko.observable<string>()
    products = ko.observableArray<any>()
    hotKeywords: KnockoutObservableArray<string> = ko.observableArray<string>()
    historyKeywords: KnockoutObservableArray<string> = ko.observableArray<string>()
    selectKeyworkd = (keyword: string) => {
        this.searchText(keyword);
        this.search();
    }
    search = (): JQueryPromise<string> => {

        //if (searchText != null && this.searchText() != searchText)
        //    this.searchText(searchText);
        var searchText: string = this.searchText();
        var result: JQueryPromise<any>;
        if (!searchText) {
            result = $.Deferred();
            result['loadCompleted'] = true;
            (<JQueryDeferred<any>>result).resolve();
        }
        else {
            this.status(Status.searching);
            result = station.searchProducts(searchText, page_index)
                .done((data: any[]) => {
                    this.products(data);
                    this.status(Status.complete);
                
                    //==================================================
                    // 去掉重复的关键字
                    var keywords = new Array<string>();
                    var historyKeywords = this.historyKeywords();
                    for (var i = 0; i < historyKeywords.length; i++) {
                        if (historyKeywords[i] == searchText)
                            continue;

                        keywords.push(historyKeywords[i]);
                    }
                    //==================================================

                    keywords.unshift(searchText);
                    this.historyKeywords(keywords);
                    site.storage.historyKeywords = keywords;//this.historyKeywords();
                });
        }
        return result;
    }
    clearHistoryKeywords = () => {
        site.storage.historyKeywords = [];
        this.historyKeywords([]);
    }

    constructor() {
        this.searchText.subscribe(() => page_index = 0);
        this.searchText.subscribe((value) => {
            if (!this.searchText())
                this.status(Status.ready)
        });
    }
}

export = function (page: chitu.Page) {
    var model = new Model();
    page.viewChanged.add(() => ko.applyBindings(model, page.node));

    station.hotKeywords().done((data) => {
        model.hotKeywords(data);
    });

    page.load.add(() => {
        var data = site.storage.get_item<string[]>('historyKeyword');
        model.historyKeywords(site.storage.historyKeywords);
        return model.search();
    });

}