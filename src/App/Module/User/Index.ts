import app = require('Application');
import site = require('Site');
import account = require('Services/Account');
import member = require('Services/Member');
import services = require('Services/Service');

requirejs(['css!content/User/Index']);

export = class UserIndexPage extends chitu.Page {
    private model = {
        groups: [],
        showItemPage: function (item) {
            if (item.url == '#User_Logout') {
                //account.logout();
                return app.redirect('#Home_Index');
            }
            return app.redirect(item.url);
        },
        member: {
            Score: ko.observable(),
            Level: ko.observable(),
            UserName: ko.observable(),
            Banlance: ko.observable(0)
        },
        notPaidCount: account.orderInfo.notPaidCount,
        toReceiveCount: account.orderInfo.toReceiveCount,
        evaluateCount: account.orderInfo.evaluateCount,
        username: ko.observable(),
        balance: ko.observable(),
        headImageUrl: member.currentUserInfo.HeadImageUrl, //ko.observable(),
        nickName: member.currentUserInfo.NickName,
    }

    private score_menu_item = { name: '我的积分', url: '#User_ScoreList', value: ko.observable() };

    constructor(html) {
        super(html);


        var i = 0;
        this.model.groups[i++] = [
            { name: '收货地址', url: '#User_ReceiptList', value: ko.observable() },
            { name: '我的收藏', url: '#User_Favors', value: ko.observable() },
            this.score_menu_item,
            { name: '我的优惠券', url: '#User_Coupon', value: ko.observable() },
        ];


        this.model.groups[i++] = [
            { name: '账户安全', url: '#AccountSecurity_Index', value: '' },
            //{ name: '修改密码', url: '#User_ModifyPassword', value: ko.observable() },
        ];

        if (!services['weixin']) {
            this.model.groups[this.model.groups.length - 1].push({ name: '退出', url: '#User_Index_Logout', value: ko.observable() })
        }

        this.load.add(this.page_load);
    }

    private page_load(sender: UserIndexPage, args) {
        //debugger;
        ko.applyBindings(sender.model, sender.element);
        if ((args.type || '') == 'Logout') {
            member.logout();
            app.redirect('Home_Index');
            return;
        }

        var result = account.userInfo().done(function (result) {
            sender.model.notPaidCount(result.NotPaidCount);
            sender.model.toReceiveCount(result.SendCount);
            sender.model.evaluateCount(result.ToEvaluateCount);
            sender.model.username(result.UserName);
            sender.model.balance(result.Balance);
            sender.score_menu_item.value(result.Score);
        });
        return result;
    }
}

//export = UserIndexPage;

// export = function (page: chitu.Page) {
//     /// <param name="page" type="chitu.Page"/>

//     var model = {
//         groups: [],
//         showItemPage: function (item) {
//             if (item.url == 'User_Logout') {
//                 //account.logout();
//                 return app.redirect('Home_Index');
//             }
//             return app.redirect(item.url);
//         },
//         member: {
//             Score: ko.observable(),
//             Level: ko.observable(),
//             UserName: ko.observable(),
//             Banlance: ko.observable(0)
//         },
//         notPaidCount: account.orderInfo.notPaidCount,
//         toReceiveCount: account.orderInfo.toReceiveCount,
//         evaluateCount: account.orderInfo.evaluateCount,
//         username: ko.observable(),
//         balance: ko.observable(),
//         headImageUrl: member.currentUserInfo.HeadImageUrl, //ko.observable(),
//         nickName: member.currentUserInfo.NickName,
//     }


//     var score_menu_item = { name: '我的积分', url: '#User_ScoreList', value: ko.observable() }
//     var i = 0;
//     model.groups[i++] = [
//         { name: '收货地址', url: '#User_ReceiptList', value: ko.observable() },
//         { name: '我的收藏', url: '#User_Favors', value: ko.observable() },
//         score_menu_item,
//         { name: '我的优惠券', url: '#User_Coupon', value: ko.observable() },
//     ];

//     //model.groups[1] = [
//     //    { name: '我的二维码', url: '#User_ModifyPassword' },
//     //    { name: '我的会员', url: '#User+ReceiptList' },
//     //];

//     model.groups[i++] = [
//         { name: '账户安全', url: '#User_AccountSecurity_Index', value: '' },
//         //{ name: '修改密码', url: '#User_ModifyPassword', value: ko.observable() },
//     ];
//     if (!services['weixin']) {
//         model.groups[model.groups.length - 1].push({ name: '退出', url: '#User_Index_Logout', value: ko.observable() })
//     }

//     page.load.add(function (sender, args): JQueryPromise<any> {
//         //debugger;
//         if ((args.type || '') == 'Logout') {
//             member.logout();
//             app.redirect('Home_Index');
//             return;
//         }

//         var result = account.userInfo().done(function (result) {
//             model.notPaidCount(result.NotPaidCount);
//             model.toReceiveCount(result.SendCount);
//             model.evaluateCount(result.ToEvaluateCount);
//             model.username(result.UserName);
//             model.balance(result.Balance);
//             score_menu_item.value(result.Score);
//         });
//         return result;
//     });

//     page.viewChanged.add(() => ko.applyBindings(model, page.element));

// } 