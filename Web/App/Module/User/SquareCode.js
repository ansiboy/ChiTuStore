chitu.action(['sv/Account'], function (page) {
    /// <param name="page" type="chitu.Page"/>

    page.load.add(function () {

        app.header.title('我的二维码');
        app.header.returnUrl('User/Index');

        return services.account.getSquareCode().done(function (url) {
            var node = page.node();
            $(node).find('img').attr('src', url);

        })
    });

});