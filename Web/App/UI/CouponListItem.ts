import mapping = require('knockout.mapping');

ko.components.register('coupon-list-item', {
    viewModel: function (params: any) {
        $.extend(this, params.value);
        this.Selected = this.Selected || false;
        //debugger;
    },
    template:
    '<div class="coupon"> \
         <div style="position:relative;top:4px;left:16px;width:100%;padding-left:50px;top:4px;" class="pull-left"> \
             <div data-bind="html:Title"></div> \
             <div style="padding-top:6px;"> \
                <span style="padding-right:8px;">有效期 </span><span data-bind="text:[\'{0:d}\',ValidBegin]"></span> 至 <span data-bind="text:[\'{0:d}\',ValidEnd]"></span> \
             </div> \
             <div data-bind="html:Remark" style="padding-top:6px;"> \
             </div> \
         </div> \
         <div style=\'text-align:center;position:absolute;\'> \
             <div data-bind="text:Discount + \'元\'" style="font-size:24px;"></div> \
             <div data-bind="html:StatusText" style="padding-left:4px;"></div> \
             <div data-bind="visible:Selected" style="position:relative;top:6px;"><i class="icon-ok-sign text-primary" style="font-size:26px;"></i></div> \
         </div> \
         <div class="clearfix"></div> \
     </div>'
});