var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Member', 'knockout.mapping', 'Services/Account'], function (require, exports, member, mapping, account) {
    "use strict";
    requirejs(['css!content/User/UserInfoItemEdit']);
    var province_none = { Name: '请选择省' };
    var titles = {
        Gender: '性别',
        NickName: '昵称',
        Region: '地区'
    };
    var PageModel = (function () {
        function PageModel(page) {
            var _this = this;
            this._$privonce = null;
            this._$city = null;
            this.userInfo = member.currentUserInfo;
            this.back = function () { return location.href = '#User_UserInfo'; };
            this.field = ko.observable('');
            this.gender = function (value) {
                return function () {
                    var obj = $.extend(mapping.toJS(_this.userInfo), { Gender: value });
                    member.setUserInfo(obj).done(function () {
                        _this.userInfo.Gender(value);
                        _this.back();
                    });
                };
            };
            this.provinces = ko.observableArray();
            this.cities = ko.observableArray();
            this.selecteProvince = function (item) {
                _this.currentProvince(item.Name);
                _this.cities.removeAll();
                _this.showCity();
                account.getCities(item.Id).done(function (cities) {
                    _this.cities(cities);
                });
            };
            this.currentProvince = ko.observable();
            this.currentCity = ko.observable();
            this.currentNickName = ko.observable();
            this.selecteCity = function (item) {
                _this.currentCity(item.Name);
                var obj = $.extend(mapping.toJS(_this.userInfo), { Province: _this.currentProvince(), City: _this.currentCity() });
                member.setUserInfo(obj).done(function () {
                    _this.userInfo.Province(_this.currentProvince());
                    _this.userInfo.City(_this.currentCity());
                    _this.back();
                });
            };
            this.isCity = false;
            this.page = page;
        }
        PageModel.prototype.$privonce = function () {
            if (!this._$privonce)
                this._$privonce = $(this.page.element).find('[name="province"]');
            return this._$privonce;
        };
        ;
        PageModel.prototype.$city = function () {
            if (!this._$city)
                this._$city = $(this.page.element).find('[name="city"]');
            return this._$city;
        };
        ;
        PageModel.prototype.hideCity = function () {
            this.$privonce().slideDown();
            this.$city().hide();
            this.isCity = false;
        };
        ;
        PageModel.prototype.showCity = function () {
            this.$privonce().slideUp();
            this.$city().show();
            this.isCity = true;
        };
        ;
        return PageModel;
    }());
    var UserInfoItemEditPage = (function (_super) {
        __extends(UserInfoItemEditPage, _super);
        function UserInfoItemEditPage(html) {
            var _this = this;
            _super.call(this, html);
            this.model = new PageModel(this);
            var model = this.model;
            model.userInfo.Province.subscribe(function (value) { return model.currentProvince(value); });
            model.userInfo.City.subscribe(function (value) { return model.currentCity(value); });
            model.userInfo.NickName.subscribe(function (value) { return model.currentNickName(value); });
            this.load.add(function (sender, args) {
                ko.applyBindings(_this.model, _this.element);
                model.field(args.field);
                model.currentProvince(model.userInfo.Province());
                model.currentCity(model.userInfo.City());
                model.currentNickName(model.userInfo.NickName());
                account.getProvinces().pipe(function (data) {
                    for (var i = 0; i < data.length; i++)
                        data[i].Value = data[i].Name;
                    model.provinces(data);
                    return member.getUserInfo();
                });
                return $.Deferred().resolve();
            });
        }
        return UserInfoItemEditPage;
    }(chitu.Page));
    return UserInfoItemEditPage;
});
