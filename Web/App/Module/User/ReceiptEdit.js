define(["require", "exports", 'knockout.validation', 'knockout.mapping', 'Services/Account', 'Application'], function (require, exports, ko_val, mapping, account, app) {
    requirejs(['css!content/User/ReceiptEdit']);
    var province_none = { Name: '请选择省' };
    var city_none = { Name: '请选择城市' };
    var county_none = { Name: '请选择县' };
    var validation;
    var Receipt = (function () {
        function Receipt() {
            this.Id = ko.observable();
            this.Address = ko.observable().extend({ required: true });
            this.CityId = ko.observable().extend({ required: true });
            this.CountyId = ko.observable().extend({ required: true });
            this.ProvinceId = ko.observable().extend({ required: true });
            this.Mobile = ko.observable().extend({
                required: true,
                validation: [{
                        validator: function (value, params) {
                            value = value || '';
                            return value.length == 11 && /^1[34578]\d{9}$/.test(value);
                        },
                        message: '请输入正确的手机号码'
                    }]
            });
            this.Name = ko.observable().extend({ required: true });
            this.PostalCode = ko.observable();
            this.Consignee = ko.observable().extend({ required: true });
            this.IsDefault = ko.observable(false);
            this.AreaCode = ko.observable();
            this.PhoneNumber = ko.observable();
            this.BranchNumber = ko.observable();
            this.Phone = ko.computed({
                read: function () {
                    var phone = '';
                    var areaCode = $.trim(this.AreaCode());
                    var phoneNumber = $.trim(this.PhoneNumber());
                    var branchNumber = $.trim(this.BranchNumber());
                    if (areaCode != '' && phoneNumber != '')
                        phone = areaCode + '-' + phoneNumber;
                    if (phone != '' && branchNumber != '')
                        phone = phone + '-' + branchNumber;
                    return phone == '' ? null : phone;
                },
                write: function (value) {
                    if (value == null || value == '')
                        return;
                    var arr = value.split('-');
                    this.AreaCode(arr[0]);
                    this.PhoneNumber(arr[1]);
                    this.BranchNumber(arr[2]);
                }
            }, this);
        }
        return Receipt;
    })();
    var Model = (function () {
        function Model(page) {
            var _this = this;
            this.receipt = new Receipt();
            this.allowSelect = ko.observable(false);
            this.provinces = ko.observableArray();
            this.cities = ko.observableArray();
            this.counties = ko.observableArray();
            this.enableProvince = function () {
                _this.province().removeAttr('disabled');
            };
            this.loadCities = function (provinceId) {
                /// <returns type="jQuery.Deferred"/>
                _this.city().attr('disabled', 'disabled');
                _this.county().attr('disabled', 'disabled');
                if (_this.isEmptyId(provinceId))
                    return $.Deferred().resolve();
                _this.cities.removeAll();
                _this.counties.removeAll();
                var result = account.getCities(provinceId).done(function (items) {
                    _this.cities.push(city_none);
                    for (var i = 0; i < items.length; i++) {
                        _this.cities.push(items[i]);
                    }
                    _this.city().removeAttr('disabled');
                });
                return result;
            };
            this.loadCounties = function (cityId) {
                /// <returns type="jQuery.Deferred"/>
                _this.county().attr('disabled', 'disabled');
                if (_this.isEmptyId(cityId))
                    return $.Deferred().resolve();
                _this.counties.removeAll();
                var result = account.getCounties(cityId).done(function (items) {
                    _this.counties.push(county_none);
                    for (var i = 0; i < items.length; i++) {
                        _this.counties.push(items[i]);
                    }
                    _this.county().removeAttr('disabled');
                });
                return result;
            };
            this.saveReceipt = function () {
                validation = ko_val.group(_this.receipt);
                if (!_this.receipt['isValid']()) {
                    validation.showAllMessages();
                    return $.Deferred().reject();
                }
                return account.saveReceiptInfo(_this.receipt).done(function () {
                    var list_page = app.getCachePage('User.ReceiptList');
                    if (list_page) {
                        list_page.on_load({});
                    }
                    app.back();
                });
            };
            this.isEmptyId = function (id) {
                return id == '' || id == null || id == '00000000-0000-0000-0000-000000000000';
            };
            this.receiptNode = function () {
                return $(_this.page.node()).find('[name="Receipt"]')[0];
            };
            this.province = function () {
                return $(_this.page.node()).find('[name="Province"]');
            };
            this.city = function () {
                return $(_this.page.node()).find('[name="City"]');
            };
            this.county = function () {
                return $(_this.page.node()).find('[name="County"]');
            };
            this.onProvinceChanged = function () {
                var provinceId = _this.province().find('option:selected').val();
                var provinceName = _this.province().find('option:selected').text();
                _this.loadCities(provinceId);
            };
            this.onCityChanged = function () {
                var cityId = _this.city().find('option:selected').val();
                var cityName = _this.city().find('option:selected').text();
                _this.loadCounties(cityId);
            };
            this.onCountyChanged = function () {
                var countyId = _this.county().find('option:selected').val();
                var countyName = _this.county().find('option:selected').text();
            };
            this.page = page;
        }
        return Model;
    })();
    return function (page) {
        /// <param name="page" type="chitu.Page"/>
        var model = new Model(page);
        page.load.add(function (sender, args) {
            /// <param name="sender" type="chitu.Page"/>
            debugger;
            if (!args.id) {
                var obj = mapping.toJS(new Receipt());
                mapping.fromJS(obj, {}, model.receipt);
                return;
            }
            return account.getReceiptInfo(args.id)
                .done(function (data) {
                debugger;
                mapping.fromJS(data, {}, model.receipt);
                var receipt = model.receipt;
                var provinceId = data.ProvinceId;
                var cityId = data.CityId;
                var countyId = data.CountyId;
                model['receipts'] = args.receipts;
                model.enableProvince();
                return model.loadCities(provinceId).pipe(function () {
                    model.receipt.CityId(cityId);
                    model.onCityChanged();
                    return model.loadCounties(cityId);
                })
                    .done(function () {
                    model.receipt.CountyId(countyId);
                    model.onCountyChanged();
                });
            });
        });
        page.viewChanged.add(function () { return ko.applyBindings(model, page.node()); });
        return account.getProvinces().done(function (provinces) {
            model.provinces.push(province_none);
            for (var i = 0; i < provinces.length; i++) {
                model.provinces.push(provinces[i]);
            }
        });
    };
});
