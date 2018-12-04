angular.module( 'orderCloud' )
    .service( 'ocProductChangeLog', OrderCloudProductChangeLogService );

    
function OrderCloudProductChangeLogService( $uibModal ) {
    let service = {
        Open: _open
    };

    function _open( product ) {        
        return $uibModal.open( {
            backdrop: 'static',
            templateUrl: 'productManagement/productChangeLog/templates/productChangeLog.modal.html',
            controller: 'ProductChangeLogCtrl',
            controllerAs: 'productChangeLog',
            size: 'lg',
            animation: false,
            resolve: {
                SelectedProduct: function() {                    
                    return product;
                }
            }
        } ).result;
    }

    return service;
}