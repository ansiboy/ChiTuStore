import member = require('Services/Member');
import account = require('Services/Account');
import ko_val = require('knockout.validation');
import site = require('Site');
import mapping = require('knockout.mapping');
import c = require('ui/ScrollLoad');

requirejs(['css!content/User/UserInfo']);

var province_none = { Name: '请选择省' };
class Model {

    private city_none = { Name: '请选择城市' };
    private county_none = { Name: '请选择县' }

    constructor() {

        this.userInfo.NickName.extend({ required: { message: '请输入昵称' } });
        this.userInfo.Province.extend({ required: { message: '请选择省' } });
        this.userInfo.City.extend({
            required: {
                message: '请选择城市',
                onlyIf: () => {
                    return this.userInfo.Province() != null;
                }
            }
        })
        this.userInfo.Gender.extend({ required: true });

        this.userInfo.Province.subscribe((value) => {
            if (value == province_none) {
                return;
            }

            account.getCities(value).done((cities) => {
                for (var i = 0; i < cities.length; i++)
                    cities[i].Value = cities[i].Name;

                cities.unshift(this.city_none);
                this.cities(cities);
            });
        });


        this.val = ko_val.group(this.userInfo);
    }
    val: KnockoutValidationErrors
    userInfo = {
        NickName: ko.observable(),
        Country: ko.observable(),
        Province: ko.observable(),
        City: ko.observable(),
        HeadImageUrl: ko.observable(),
        Gender: ko.observable('Male')
    }
    save = () => {
        if (!this.userInfo['isValid']()) {
            this.val.showAllMessages();
            return $.Deferred().reject();
        }

        var userInfo = mapping.toJS(this.userInfo);
        return member.setUserInfo(userInfo);
    }
    provinces = ko.observableArray()
    cities = ko.observableArray()
}

export = function (page: chitu.Page) {


    var model = new Model();

    ko.applyBindings(model, page.node());

    requirejs(['scr/jQuery.FileUpload/jquery.fileupload'], function () {
        $(page.node()).find('[type="file"]')['fileupload']({
            url: site.config.memberServiceUrl + 'UserInfo/UploadImage/',
            formData: { '$appToken': site.cookies.appToken(), '$token': site.cookies.token() },
            dataType: 'json'
        }).on('fileuploaddone', function (e, data) {
            var memberSite = $('<a>').attr('href', site.config.memberServiceUrl).prop('host');
            model.userInfo.HeadImageUrl('http://' + memberSite + data.result.path);
        }).on('fileuploadfail', function (error) {
            alert('上传图片失败');
        });
    });

    c.scrollLoad(page);

    return account.getProvinces().pipe(function (data) {
        /// <param name="data" type="Array"/>
        for (var i = 0; i < data.length; i++)
            data[i].Value = data[i].Name;

        data.unshift(province_none);
        model.provinces(data);

        return member.getUserInfo();
    })
        .done(function (data) {
            mapping.fromJS(data, {}, model.userInfo);
            window.setTimeout(function () {
                model.userInfo.City(data.City);
            }, 500);
        });

} 