angular.module('orderCloud')
    .controller('ProductInventoryCtrl', ProductInventoryController)
;

function ProductInventoryController($exceptionHandler, toastr, ocProductInventory, SelectedProduct) {
    var vm = this;
    vm.product = angular.copy(SelectedProduct);
    vm.updateProductInventory = updateProductInventory;

    function updateProductInventory(product) {
        vm.loading = ocProductInventory.Update(product)
            .then(function(updatedProduct) {
                vm.product = angular.copy(updatedProduct);
                //reassign value to selectproduct as it is showing old when user come back to Invetory tab
                SelectedProduct.Inventory.QuantityAvailable = vm.product.Inventory.QuantityAvailable;
                vm.ProductInventoryForm.$setPristine();
                toastr.success(updatedProduct.Name + ' inventory was updated');
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            })
    }
}