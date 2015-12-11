chitu.action((function () {
    var references = [];

    if (services == null) references.push('sv/Services');
    if (services == null || services.member == null) references.push('sv/Member');
    if (services == null || services.account == null) references.push('sv/Account');
    if (!$.fn.fileupload) references.push('jQuery.FileUpload/jquery.fileupload');

    if (!ko.mapping) references.push('ko.mapping');
    if (!ko.validation) references.push('ko.val');

    references.push('css!content/User/UserInfo');

    return references;
})(),

function (page) {
    /// <param name="page" type="chitu.Page"/>

    //var empty_id = '00000000-0000-0000-0000-000000000000';
    var province_none = { Name: '请选择省' };
    var city_none = { Name: '请选择城市' };
    var county_none = { Name: '请选择县' }

    var model = {
        userInfo: {
            NickName: ko.observable(),
            Country: ko.observable(),
            Province: ko.observable(),
            City: ko.observable(),
            HeadImageUrl: ko.observable(),
            Gender: ko.observable('Male')
        },
        save: function () {
            if (!model.userInfo.isValid())
                return val.showAllMessages();

            var userInfo = ko.mapping.toJS(model.userInfo);
            return services.member.setUserInfo(userInfo);
        },
        provinces: ko.observableArray(),
        cities: ko.observableArray()
    };

    model.userInfo.NickName.extend({ required: { message: '请输入昵称' } });
    model.userInfo.Province.extend({ required: { message: '请选择省' } });
    model.userInfo.City.extend({
        required: {
            message: '请选择城市',
            onlyIf: function () {
                return model.userInfo.Province() != null;
            }
        }
    });
    model.userInfo.Gender.extend({ required: true });

    model.userInfo.Province.subscribe(function (value) {
        if (value == province_none) {
            return;
        }

        services.account.getCities(value).done(function (cities) {
            for (var i = 0; i < cities.length; i++)
                cities[i].Value = cities[i].Name;

            cities.unshift(city_none);
            model.cities(cities);
        });
    });

    var val = ko.validation.group(model.userInfo);
    ko.applyBindings(model, page.node());

    $(page.node()).find('[type="file"]').fileupload({
        url: site.config.memberServiceUrl + 'UserInfo/UploadImage/',
        formData: { '$appToken': site.cookies.appToken(), '$token': site.cookies.token() },
        dataType: 'json'
    }).on('fileuploaddone', function (e, data) {
        var memberSite = $('<a>').attr('href', site.config.memberServiceUrl).prop('host');
        model.userInfo.HeadImageUrl('http://' + memberSite + data.result.path);
    }).on('fileuploadfail', function (error) {
        alert('上传图片失败');
    });

    return services.account.getProvinces().pipe(function (data) {
        /// <param name="data" type="Array"/>
        for (var i = 0; i < data.length; i++)
            data[i].Value = data[i].Name;

        data.unshift(province_none);
        model.provinces(data);

        return services.member.getUserInfo();
    })
     .done(function (data) {
         ko.mapping.fromJS(data, {}, model.userInfo);
         window.setTimeout(function () {
             model.userInfo.City(data.City);
         }, 500);
     });




});