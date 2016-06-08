
import TopBar = require('UI/TopBar');
import app = require('Application');
import member = require('Services/Member');
import mapping = require('knockout.mapping');
import account = require('Services/Account');
import move = require('move');
import site = require('Site');
import IScroll = require('iscroll');

requirejs(['css!content/User/UserInfoItemEdit']);

var province_none = { Name: '请选择省' };

var titles = {
    Gender: '性别',
    NickName: '昵称',
    Region: '地区'
}

class PageModel {
    private page: UserInfoItemEditPage;
    constructor(page: UserInfoItemEditPage) {
        this.page = page;
    }
    _$privonce = <JQuery>null;
    _$city = <JQuery>null;
    userInfo = member.currentUserInfo;
    back = () => location.href = '#User_UserInfo';
    field = ko.observable<string>('');
    gender = (value) => {
        return () => {
            var obj = $.extend(mapping.toJS(this.userInfo), { Gender: value });
            member.setUserInfo(obj).done(() => {
                this.userInfo.Gender(value);
                this.back();
            });
        }
    };
    provinces = ko.observableArray();
    cities = ko.observableArray();
    selecteProvince = (item) => {
        this.currentProvince(item.Name);
        this.cities.removeAll();

        this.showCity();

        account.getCities(item.Id).done((cities) => {
            this.cities(cities);
        });
    };
    saveNickName: () => {

    };
    currentProvince = ko.observable<string>();
    currentCity = ko.observable<string>();
    currentNickName = ko.observable<string>();
    selecteCity = (item) => {
        this.currentCity(item.Name);
        var obj = $.extend(mapping.toJS(this.userInfo), { Province: this.currentProvince(), City: this.currentCity() });
        member.setUserInfo(obj).done(() => {
            this.userInfo.Province(this.currentProvince());
            this.userInfo.City(this.currentCity());
            this.back()
        });
    };
    $privonce() {
        if (!this._$privonce)
            this._$privonce = $(this.page.element).find('[name="province"]');

        return this._$privonce;
    };
    $city() {
        if (!this._$city)
            this._$city = $(this.page.element).find('[name="city"]');

        return this._$city;
    };
    hideCity() {
        this.$privonce().slideDown();
        this.$city().hide();

        this.isCity = false;

        // if (this.page['iscroller']) {
        //     window.setTimeout(() => this.page['iscroller'].refresh(), 500);
        // }
    };
    showCity() {
        this.$privonce().slideUp();
        this.$city().show();
        this.isCity = true;

        // if (page['iscroller']) {
        //     window.setTimeout(() => page['iscroller'].refresh(), 1000);
        // }
    };
    isCity = false;
}

class UserInfoItemEditPage extends chitu.Page {
    private model: PageModel;
    constructor(html) {
        super(html);
        this.model = new PageModel(this);

        let model = this.model;
        model.userInfo.Province.subscribe((value) => model.currentProvince(value));
        model.userInfo.City.subscribe((value) => model.currentCity(value));
        model.userInfo.NickName.subscribe((value) => model.currentNickName(value));

        this.load.add((sender, args) => {
            ko.applyBindings(this.model, this.element);

            model.field(args.field);
            
            model.currentProvince(model.userInfo.Province());
            model.currentCity(model.userInfo.City());
            model.currentNickName(model.userInfo.NickName());

            account.getProvinces().pipe(function (data) {
                for (var i = 0; i < data.length; i++)
                    data[i].Value = data[i].Name;

                model.provinces(data);
                return member.getUserInfo();
            })
            return $.Deferred().resolve();
        });
    }
}

export = UserInfoItemEditPage;