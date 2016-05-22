var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Application', 'Services/Account', 'Services/Member', 'Services/Service'], function (require, exports, app, account, member, services) {
    requirejs(['css!content/User/Index']);
    return (function (_super) {
        __extends(UserIndexPage, _super);
        function UserIndexPage() {
            _super.call(this);
            this.model = {
                groups: [],
                showItemPage: function (item) {
                    if (item.url == 'User_Logout') {
                        return app.redirect('Home_Index');
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
                headImageUrl: member.currentUserInfo.HeadImageUrl,
                nickName: member.currentUserInfo.NickName,
            };
            this.score_menu_item = { name: '我的积分', url: '#User_ScoreList', value: ko.observable() };
            var i = 0;
            this.model.groups[i++] = [
                { name: '收货地址', url: '#User_ReceiptList', value: ko.observable() },
                { name: '我的收藏', url: '#User_Favors', value: ko.observable() },
                this.score_menu_item,
                { name: '我的优惠券', url: '#User_Coupon', value: ko.observable() },
            ];
            this.model.groups[i++] = [
                { name: '账户安全', url: '#User_AccountSecurity_Index', value: '' },
            ];
            if (!services['weixin']) {
                this.model.groups[this.model.groups.length - 1].push({ name: '退出', url: '#User_Index_Logout', value: ko.observable() });
            }
            this.load.add(this.page_load);
        }
        UserIndexPage.prototype.page_load = function (sender, args) {
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
        };
        return UserIndexPage;
    })(chitu.Page);
});
