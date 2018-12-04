angular.module('orderCloud')
    .controller('ProductCtrl', ProductController);

function ProductController($exceptionHandler, $rootScope, $state, toastr, imagestorageurl, OrderCloudSDK, ocProducts, ocNavItems, ocRelatedProducts, ocProductPricing, SelectedProduct, changeLogService) {
    var vm = this;
    vm.model = angular.copy(SelectedProduct);
    vm.oldProductValues = _.pick(vm.model, ['ID', 'Name', 'Description', 'QuantityMultiplier', 'Inventory', 'Active']);
    vm.oldProductValues.xp =_.pick(vm.model.xp, ['Featured', 'ApprovalRequired', 'Brand', 'Keywords', 'Comments', 'UnitOfMeasure', 'Images', 'WhileSuppliesLast']);
    vm.productName = angular.copy(SelectedProduct.Name);
    vm.inventoryEnabled = angular.copy(SelectedProduct.Inventory ? SelectedProduct.Inventory.Enabled : false);
    vm.updateProduct = updateProduct;
    vm.deleteProduct = deleteProduct;
    vm.createDefaultPrice = createDefaultPrice;
    vm.defaultImage = vm.model.xp && vm.model.xp.Images && vm.model.xp.Images.length ? `${imagestorageurl}${vm.model.xp.Images[0].StorageName}` : '';
    if (!vm.model.xp.Images || !vm.model.xp.Images.length) vm.model.xp.Images = [{}];
    
    vm.navigationItems = ocNavItems.Filter(ocNavItems.Product());
    vm.state = $state.current.name;
    vm.fileUploadOptions = {
        keyname: 'Images',
        src: imagestorageurl,
        folder: null,
        extensions: 'jpg, png, gif, jpeg, tiff',
        invalidExtensions: null,
        onUpdate: null,
        multiple: false,
        addText: 'Upload an image',
        replaceText: 'Replace'
    };

    vm.descriptionToolbar = [
        ['html', 'bold', 'italics', 'underline', 'strikeThrough'],
        ['h1', 'h2', 'h3', 'p'],
        ['ul', 'ol'],
        ['insertLink', 'insertImage', 'insertVideo']
    ];

    vm.setKeywords = _setKeywords;

    function _setKeywords(){
        if(vm.model.xp && vm.model.xp.Keywords){
           vm.keywords = _.map(vm.model.xp.Keywords, function(keyword){
            return { text : keyword}; 
           });
        }else{
            if(!vm.model.xp)vm.model.xp = { };
            vm.model.xp.Keywords = [];
            vm.keywords  = []; 
        }
    }

    function getKeywords (){
        //returns an array of keywords
        return _.map(vm.keywords, function(keyword){
            return keyword.text;    
        });
    }

    function updateProduct() {
        var currentPrice = angular.copy(vm.model.DefaultPriceSchedule);
        var partial = _.pick(vm.model, ['ID', 'Name', 'Description', 'QuantityMultiplier', 'Inventory', 'Active']);
        var partialXP = _.pick(vm.model.xp, ['Featured', 'ApprovalRequired', 'Brand', 'Keywords', 'Comments', 'UnitOfMeasure', 'Images', 'WhileSuppliesLast']);
        vm.newProductValues = _.pick(vm.model, ['ID', 'Name', 'Description', 'QuantityMultiplier', 'Inventory', 'Active']);
        vm.newProductValues.xp =_.pick(vm.model.xp, ['Featured', 'ApprovalRequired', 'Brand', 'Keywords', 'Comments', 'UnitOfMeasure', 'Images', 'WhileSuppliesLast']);
        partial.xp = partialXP;
        partial.xp.Keywords = getKeywords();
        vm.newProductValues.xp.Keywords = getKeywords();

        vm.loading = OrderCloudSDK.Products.Patch(SelectedProduct.ID, partial)
            .then(function (data) {

                //Account for changes in ID
                if (data.ID !== SelectedProduct.ID) {
                    $state.go('.', {productid: data.ID}, {notify: false});

                    //Sync other products that have this product in xp.RelatedProducts array
                    //This only makes API calls if the product has related products
                    ocRelatedProducts.Sync(data.xp.RelatedProducts, data.ID, SelectedProduct.ID);
                }

                //Update the view model
                vm.model = angular.copy(data);
                if (currentPrice && data.Name !== SelectedProduct.Name) {
                    OrderCloudSDK.PriceSchedules.Patch(currentPrice.ID, {
                            Name: data.Name + ' Default Price'
                        })
                        .then(function (updatedPrice) {
                            vm.model.DefaultPriceSchedule = updatedPrice;
                        });
                } else {
                    vm.model.DefaultPriceSchedule = currentPrice;
                }


                vm.productName = angular.copy(data.Name);
                vm.inventoryEnabled = angular.copy(data.InventoryEnabled);
                SelectedProduct = data;
                SaveProductChangeLog();
                // REASSIGN OLD VALUES AS MODEL CHANGED
                vm.oldProductValues = _.pick(vm.model, ['ID', 'Name', 'Description', 'QuantityMultiplier', 'Inventory', 'Active']);
                vm.oldProductValues.xp =_.pick(vm.model.xp, ['Featured', 'ApprovalRequired', 'Brand', 'Keywords', 'Comments', 'UnitOfMeasure', 'Images', 'WhileSuppliesLast']);
                vm.oldProductValues.xp.Keywords = getKeywords();
                vm.form.$setPristine();
                toastr.success(data.Name + ' was updated');
            });
    }

     // SAVE CHANGE LOG 
     function SaveProductChangeLog() {
        if (vm.oldProductValues.xp.Keywords != null && vm.oldProductValues.xp.Keywords.length > 0)
            vm.strOldKeywords = vm.oldProductValues.xp.Keywords.join();

        if (vm.newProductValues.xp.Keywords != null && vm.newProductValues.xp.Keywords.length > 0)
            vm.strNewKeywords = vm.newProductValues.xp.Keywords.join();

        let changeLogRequest = {
            oldProduct: {
                id: vm.oldProductValues.ID == undefined ? null : vm.oldProductValues.ID,
                name: vm.oldProductValues.Name == undefined ? null : vm.oldProductValues.Name,
                description: vm.oldProductValues.Description == undefined ? null : vm.oldProductValues.Description,
                brand: vm.oldProductValues.xp.Brand == undefined ? null : vm.oldProductValues.xp.Brand,
                comments: vm.oldProductValues.xp.Comments == undefined ? null : vm.oldProductValues.xp.Comments,
                keywords: vm.strOldKeywords == undefined ? null : vm.strOldKeywords,
                qtyMultiplier: vm.oldProductValues.QuantityMultiplier == undefined ? null : vm.oldProductValues.QuantityMultiplier,
                unitofMeasure: vm.oldProductValues.xp.UnitOfMeasure == undefined ? null : vm.oldProductValues.xp.UnitOfMeasure,
                active: vm.oldProductValues.Active == undefined ? null : vm.oldProductValues.Active,
                approvalRequired: vm.oldProductValues.xp.ApprovalRequired == undefined ? null : vm.oldProductValues.xp.ApprovalRequired,
                whileSuppliesLast: vm.oldProductValues.xp.WhileSuppliesLast == undefined ? null : vm.oldProductValues.xp.WhileSuppliesLast
            },
            newProduct: {
                id: vm.newProductValues.ID == undefined ? null : vm.newProductValues.ID,
                name: vm.newProductValues.Name == undefined ? null : vm.newProductValues.Name,
                description: vm.newProductValues.Description == undefined ? null : vm.newProductValues.Description,
                brand: vm.newProductValues.xp.Brand == undefined ? null : vm.newProductValues.xp.Brand,
                comments: vm.newProductValues.xp.Comments == undefined ? null : vm.newProductValues.xp.Comments,
                keywords: vm.strNewKeywords == undefined ? null : vm.strNewKeywords,
                qtyMultiplier: vm.newProductValues.QuantityMultiplier == undefined ? null : vm.newProductValues.QuantityMultiplier,
                unitofMeasure: vm.newProductValues.xp.UnitOfMeasure == undefined ? null : vm.newProductValues.xp.UnitOfMeasure,
                active: vm.newProductValues.Active == undefined ? null : vm.newProductValues.Active,
                approvalRequired: vm.newProductValues.xp.ApprovalRequired == undefined ? null : vm.newProductValues.xp.ApprovalRequired,
                whileSuppliesLast: vm.newProductValues.xp.WhileSuppliesLast == undefined ? null : vm.newProductValues.xp.WhileSuppliesLast
            },
            Action : "Edit",
            productId : vm.model.ID
          }
          changeLogService.CreateChangeLog( changeLogRequest )
            .then( () => {
                console.log("Saved Sucessfully");
            } )
            .catch( ( ex ) => {
                $exceptionHandler( ex );
            } );
    }

    function deleteProduct() {
        ocProducts.Delete(SelectedProduct)
            .then(function () {
                toastr.success(SelectedProduct.Name + ' was deleted.');
                $state.go('products', {}, {
                    reload: true
                });
            });
    }

    function createDefaultPrice() {
        ocProductPricing.CreateProductPrice(vm.model, null, null, null, true)
            .then(function (data) {
                toastr.success('Default price was successfully added to ' + vm.model.Name);
                $state.go('product.pricing.priceScheduleDetail', {
                    pricescheduleid: data.SelectedPrice.ID
                }, {
                    reload: true
                });
            });
    }


    $rootScope.$on('OC:DefaultPriceUpdated', function (event, newID) {
        vm.model.DefaultPriceScheduleID = newID;
    });
}