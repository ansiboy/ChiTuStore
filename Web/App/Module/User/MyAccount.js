chitu.action(function (page) {
    /// <param name="page" type="chitu.Page"/>
    page.showing.add(function () {
        app.header.title('我的账户');
        app.header.returnUrl('User_Index');
    })
});