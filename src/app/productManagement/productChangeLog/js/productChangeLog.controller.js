angular.module( 'orderCloud' )
    .controller( 'ProductChangeLogCtrl', ProductChangeLogController );

function ProductChangeLogController( $uibModalInstance, SelectedProduct,changeLogService,toastr) {
    
    let vm = this;
    vm.item = SelectedProduct;
    vm.list = {};    
    vm.currentPage = 1;
    vm.pageSize = 5;

    let Parameters={        
        sortBy: null        
    }

    vm.parameters = Parameters;
    vm.pageChanged = pageChanged; //Reload the state with the incremented page parameter
    vm.updateSort = updateSort; //Conditionally set, reverse, remove the sortBy parameter & reload the state
    vm.loadMore = loadMore;

    function updateSort(value) {
        switch(vm.parameters.sortBy) {
            case value:
                vm.parameters.sortBy = '!' + value;
                break;
            case '!' + value:
                vm.parameters.sortBy = null;
                break;
            default:
                vm.parameters.sortBy = value;
        }
        
        GetChangeLogs();
    }

    function pageChanged() {
        vm.currentPage=vm.list.Meta.Page;
        GetChangeLogs();
    }

    function loadMore() {
        let pagenumber=vm.list.Meta.Page + 1;
        let pagesize=5;

        vm.Loading=changeLogService.GetChangeLog(vm.item.ID,pagenumber,pagesize,"!ModifiedDate")        
        .then((data) => {                   
            vm.list.Items= vm.list.Items.concat(data.Items); 
            vm.list.Meta =  data.Meta;          
        }).catch( ( ex ) => {            
            toastr.error("There is something wrong... Contact system administrator...")
        } );
    }

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };

    GetChangeLogs();
    

    function GetChangeLogs(){ 
               
        vm.Loading=changeLogService.GetChangeLog(vm.item.ID,vm.currentPage,vm.pageSize,vm.parameters.sortBy)        
        .then((data) => {                   
            vm.list.Items=data.Items; 
            vm.list.Meta =  data.Meta;          
        }).catch( ( ex ) => {            
            toastr.error("There is something wrong... Contact system administrator...")
        } );
    }
}