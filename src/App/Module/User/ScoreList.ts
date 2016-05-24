import account = require('Services/Account');

import site = require('Site');

requirejs(['css!content/User/ScoreList']);

var model = {
    scoreRecords: ko.observableArray(),
    loading: ko.observable(false)
}

function extendItem(item) {
    item.TypeText = ko.computed<string>(() => {
        switch (item.Type) {
            case 'OrderPurchase':
                return '兑换商品';
            case 'OrderConsume':
                return '消费获得积分';
        }
        return <string>item.Type;
    })

    if (item.Score > 0) {
        item.Score = '+' + item.Score;
    }
}

class ScoreListPage extends chitu.Page {
    constructor(html) {
        super(html);
        this.load.add((sender, args) => {
            ko.applyBindings(model, this.element);
            model.loading(true);
            return account.getScoreDetails().done((data) => {
                for (var i = 0; i < data.length; i++) {
                    extendItem(data[i]);
                }
                model.scoreRecords(data);
                model.loading(false);
                args.enableScrollLoad = data.length == site.config.pageSize;
            })
        });
    }
}

export = ScoreListPage;

// export = function (page: chitu.Page) {
//     //page.load.add(() => {
//     //    return account.getScoreDetails().done((data) => {
//     //        for (var i = 0; i < data.length; i++) {
//     //            extendItem(data[i]);
//     //        }
//     //        model.scoreRecords(data);
//     //    })
//     //});

//     //window.setTimeout(() => model.scoreRecords.removeAll());

//     page.viewChanged.add(() => ko.applyBindings(model, page.element));

//     page.load.add(function (sender: chitu.Page, args) {
//         model.loading(true);
//         //debugger;
//         //var result = $.Deferred().resolve().done(() => model.loading(false)); //<LoadListPromise<any>>($.Deferred() { loadCompleted: true });
//         //result['loadCompleted'] = true;
//         //return result;
//         return account.getScoreDetails().done((data) => {
//             for (var i = 0; i < data.length; i++) {
//                 extendItem(data[i]);
//             }
//             model.scoreRecords(data);
//             model.loading(false);
//             args.enableScrollLoad = data.length == site.config.pageSize;
//         })
//     });
// } 