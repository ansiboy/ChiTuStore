define(["require", "exports", 'Services/Member', 'knockout.mapping', 'Services/Account'], function (require, exports, member, mapping, account) {
    requirejs(['css!content/User/UserInfoItemEdit']);
    var province_none = { Name: '请选择省' };
    var titles = {
        Gender: '性别',
        NickName: '昵称',
        Region: '地区'
    };
    return function (page) {
        var topbar = page['topbar'];
        $(topbar.element).find('a').remove();
        topbar.createLeftButton('icon-chevron-left', function () {
            if (model.isCity) {
                model.hideCity();
            }
            else {
                model.back();
            }
        });
        var save_btn = topbar.createRightButton('', function () {
            var obj = $.extend(mapping.toJS(model.userInfo), { NickName: model.currentNickName });
            member.setUserInfo(obj).done(function () {
                model.userInfo.NickName(model.currentNickName());
                model.back();
            });
        });
        save_btn.innerHTML = '保存';
        $(save_btn).hide();
        var model = {
            _$privonce: null,
            _$city: null,
            userInfo: member.currentUserInfo,
            back: function () { return location.href = '#User_UserInfo'; },
            field: ko.observable(''),
            gender: function (value) {
                return function () {
                    var obj = $.extend(mapping.toJS(model.userInfo), { Gender: value });
                    member.setUserInfo(obj).done(function () {
                        model.userInfo.Gender(value);
                        model.back();
                    });
                };
            },
            provinces: ko.observableArray(),
            cities: ko.observableArray(),
            selecteProvince: function (item) {
                model.currentProvince(item.Name);
                model.cities.removeAll();
                model.showCity();
                account.getCities(item.Id).done(function (cities) {
                    model.cities(cities);
                });
            },
            saveNickName: function () {
            },
            currentProvince: ko.observable(),
            currentCity: ko.observable(),
            currentNickName: ko.observable(),
            selecteCity: function (item) {
                model.currentCity(item.Name);
                var obj = $.extend(mapping.toJS(model.userInfo), { Province: model.currentProvince(), City: model.currentCity() });
                member.setUserInfo(obj).done(function () {
                    model.userInfo.Province(model.currentProvince());
                    model.userInfo.City(model.currentCity());
                    model.back();
                });
            },
            $privonce: function () {
                if (!model._$privonce)
                    model._$privonce = $(page.node()).find('[name="province"]');
                return model._$privonce;
            },
            $city: function () {
                if (!model._$city)
                    model._$city = $(page.node()).find('[name="city"]');
                return model._$city;
            },
            hideCity: function () {
                model.$privonce().slideDown();
                model.$city().hide();
                model.isCity = false;
                if (page['iscroller']) {
                    window.setTimeout(function () { return page['iscroller'].refresh(); }, 500);
                }
            },
            showCity: function () {
                model.$privonce().slideUp();
                model.$city().show();
                model.isCity = true;
                if (page['iscroller']) {
                    window.setTimeout(function () { return page['iscroller'].refresh(); }, 1000);
                }
            },
            isCity: false,
        };
        model.userInfo.Province.subscribe(function (value) { return model.currentProvince(value); });
        model.userInfo.City.subscribe(function (value) { return model.currentCity(value); });
        model.userInfo.NickName.subscribe(function (value) { return model.currentNickName(value); });
        page.viewChanged.add(function () {
            ko.applyBindings(model, page.nodes().content);
        });
        page.load.add(function (sender, args) {
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
            for (var i = 0; i < data.length; i++)
                data[i].Value = data[i].Name;
            model.provinces(data);
            if (page['iscroller']) {
                window.setTimeout(function () { return page['iscroller'].refresh(); }, 1000);
            }
            return member.getUserInfo();
        })
            .done(function (data) {
        });
    };
});
