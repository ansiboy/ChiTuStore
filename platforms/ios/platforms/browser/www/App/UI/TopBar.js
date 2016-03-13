define(["require", "exports", 'Application'], function (require, exports, app) {
    var TitleBar = (function () {
        function TitleBar(element) {
            if (element == null)
                throw chitu.Errors.argumentNull('element');
            this.element = element;
            this.leftButtons = [];
            this.rightButtons = [];
        }
        TitleBar.prototype.title = function (value) {
            if (value)
                $(this.element).find('h4').html(value);
            return $(this.element).find('h4').html();
        };
        TitleBar.prototype.visible = function (value) {
            if (value === void 0) { value = undefined; }
            if (value === undefined)
                return $(this.element).is(':visible');
            if (value === false)
                $(this.element).hide();
            if (value === true)
                $(this.element).show();
        };
        TitleBar.prototype.createLeftButton = function (icon, callback) {
            var childnodes = this.element.childNodes || [];
            if (childnodes.length == 0)
                return;
            var $btn = $('<a href="javascript:" class="leftButton" style="padding-right:20px;padding-left:20px;margin-left:-20px;"><i class="' + icon + '"></i></a>')
                .insertBefore(this.element.childNodes[0]);
            $btn.on('click', callback);
            $btn.on('tap', callback);
            return $btn[0];
        };
        TitleBar.prototype.createRightButton = function (icon, callback) {
            var childnodes = this.element.childNodes || [];
            if (childnodes.length == 0)
                return;
            var $btn = $('<a href="javascript:" class="rightButton" style="padding-right:20px;padding-left:20px;margin-right:-20px;"><i class="' + icon + '"></i></a>')
                .insertBefore(this.element.childNodes[0]);
            $btn.on('click', callback);
            $btn.on('tap', callback);
            return $btn[0];
        };
        return TitleBar;
    })();
    function defaultTitle(page) {
        var values = page.routeData.values();
        var controller = values.controller;
        var action = values.action;
        var titles = {
            'User': {
                Coupon: '我的优惠券',
                Favors: '我的收藏',
                Index: '个人中心',
                Login: '登录',
                Messages: '我的消息',
                ModifyPassword: '修改密码',
                ReceiptList: '收货信息',
                ReceiptEdit: '编辑地址',
                Recharge: '充值',
                RechargeList: '充值记录',
                Register: '用户注册',
                ScoreList: '我的积分',
                UserInfo: '用户信息',
                UserInfoItemEdit: '&nbsp;'
            },
            Shopping: {
                Evaluation: '商品评价',
                OrderDetail: '订单详情',
                OrderList: '我的订单',
                OrderProducts: '确认订单',
                Invoice: '发票信息',
                ProductEvaluate: '评价晒单',
                Purchase: '订单概况',
                ShoppingCart: '购物车',
            },
            Home: {
                News: '资讯详情',
                NewsList: '微资讯',
                ProductComments: '商品评价',
                ProductList: '商品列表',
                Product: '商品详情',
                ScoreExchange: '积分兑换',
            },
            AccountSecurity: {
                MobileBinding: '手机绑定',
                MobileSetting: '手机设置',
                Setting: '&nbsp;',
                ResetPassword: '重置密码',
            },
            Error: {
                ConnectFail: '网络错误'
            }
        };
        var title = (titles[controller] || {})[action];
        return title;
    }
    function page_created(sender, page) {
        var controller = page.routeData.values().controller;
        var action = page.routeData.values().action;
        if ((controller == 'Home' && (action == 'Class'))) {
            var file_name = controller + '_' + action + '.html';
            requirejs(['text!UI/Headers/' + file_name], function (html) {
            });
            return;
        }
        var title = defaultTitle(page);
        if (title) {
            var topbar;
        }
    }
    var topbar_html = '<div class="bg-primary topbar" style="width:100%;"><h4></h4></div>';
    app.pageCreated.add(page_created);
    if (app.currentPage() != null)
        page_created(app, app.currentPage());
    return TitleBar;
});
