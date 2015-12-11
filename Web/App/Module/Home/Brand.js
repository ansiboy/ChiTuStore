chitu.action(['sv/Shopping'], function (page) {
    /// <param name="page" type="chitu.Page"/>
    var title, description;

    var model = {
        back: function () {
            app.back().fail(function () {
                app.redirect('Home_index');
            });
        },
        brand: null
    };

    page.load.add(function (sender, args) {
        return services.shopping.getBrand(args.id).done(function (brand) {
            if (!model.brand) {
                model.brand = ko.mapping.fromJS(brand);
                ko.applyBindings(model, page.node());
            }
            else {
                ko.mapping.fromJS(brand, {}, model.brand);
            }
            //title = brand.Name;
            //description = $('<div>').html(ko.unwrap(brand.Introduce)).text().trim().substr(0, 40) + '...';
    
           
        });
    });

});

