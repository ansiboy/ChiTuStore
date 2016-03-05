/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/jquery.cookie.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.mapping.d.ts' />
/// <reference path='../../../Scripts/typings/move.d.ts' />
/// <reference path='../../../Scripts/typings/iscroll.d.ts' />


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

export = function (page: chitu.Page) {


    var topbar: TopBar = (<TopBar>page['topbar']);

    $(topbar.element).find('a').remove();
    topbar.createLeftButton('icon-chevron-left', () => {
        if (model.isCity) {
            //$city.hide('slow');
            //$privonce.show('slow');
            model.hideCity();
        }
        else {
            model.back();
        }
    });

    var save_btn = topbar.createRightButton('', () => {
        var obj = $.extend(mapping.toJS(model.userInfo), { NickName: model.currentNickName });
        member.setUserInfo(obj).done(() => {
            model.userInfo.NickName(model.currentNickName());
            model.back();
        });
    });
    save_btn.innerHTML = '保存';
    $(save_btn).hide();



    var model = {
        _$privonce: <JQuery>null,
        _$city: <JQuery>null,
        userInfo: member.currentUserInfo,
        back: () => location.href = '#User_UserInfo',
        field: ko.observable<string>(''),
        gender: (value) => {
            return () => {
                var obj = $.extend(mapping.toJS(model.userInfo), { Gender: value });
                member.setUserInfo(obj).done(() => {
                    model.userInfo.Gender(value);
                    model.back();
                });
            }
        },
        provinces: ko.observableArray(),
        cities: ko.observableArray(),
        selecteProvince: (item) => {
            model.currentProvince(item.Name);
            model.cities.removeAll();

            model.showCity();

            account.getCities(item.Id).done((cities) => {
                model.cities(cities);
            });
        },
        saveNickName: () => {

        },
        currentProvince: ko.observable<string>(),
        currentCity: ko.observable<string>(),
        currentNickName: ko.observable<string>(),
        selecteCity: (item) => {
            model.currentCity(item.Name);
            var obj = $.extend(mapping.toJS(model.userInfo), { Province: model.currentProvince(), City: model.currentCity() });
            member.setUserInfo(obj).done(() => {
                model.userInfo.Province(model.currentProvince());
                model.userInfo.City(model.currentCity());
                model.back()
            });
        },
        $privonce(): JQuery {
            if (!model._$privonce)
                model._$privonce = $(page.element).find('[name="province"]');

            return model._$privonce;
            //var $city = $(page.element()).find('[name="city"]');
        },
        $city(): JQuery {
            if (!model._$city)
                model._$city = $(page.element).find('[name="city"]');

            return model._$city;
        },
        hideCity: () => {
            model.$privonce().slideDown();
            model.$city().hide();

            model.isCity = false;

            if (page['iscroller']) {
                window.setTimeout(() => page['iscroller'].refresh(), 500);
            }
        },
        showCity: () => {
            model.$privonce().slideUp();
            model.$city().show();
            model.isCity = true;

            if (page['iscroller']) {
                window.setTimeout(() => page['iscroller'].refresh(), 1000);
            }
        },
        isCity: false,

    }

    model.userInfo.Province.subscribe((value) => model.currentProvince(value));
    model.userInfo.City.subscribe((value) => model.currentCity(value));
    model.userInfo.NickName.subscribe((value) => model.currentNickName(value));


    page.viewChanged.add(() => {
        ko.applyBindings(model, page.element);
    });


    page.load.add((sender, args) => {
        model.field(args.field);
        model.currentProvince(model.userInfo.Province());
        model.currentCity(model.userInfo.City());
        model.currentNickName(model.userInfo.NickName());

        topbar.title(titles[args.field]);

        if (args.field == 'NickName') {
            $(save_btn).show();
        }

        return $.Deferred().resolve();
    });

    return account.getProvinces().pipe(function (data) {
        /// <param name="data" type="Array"/>
        for (var i = 0; i < data.length; i++)
            data[i].Value = data[i].Name;

        model.provinces(data);

        if (page['iscroller']) {
            window.setTimeout(() => page['iscroller'].refresh(), 1000);
        }

        return member.getUserInfo();
    })
        .done(function (data) {
            //mapping.fromJS(data, {}, model.userInfo);
            //window.setTimeout(function () {
            //    model.userInfo.City(data.City);
            //}, 500);
        });
} 