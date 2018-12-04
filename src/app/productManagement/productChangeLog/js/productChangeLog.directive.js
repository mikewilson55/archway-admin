angular.module( 'orderCloud' )
    .directive( 'ocProductChangeLog', OrderCloudProductChangeLogDirective );

    
function OrderCloudProductChangeLogDirective( ocProductChangeLog ) {
    return {
        restrict: 'A',
        scope: {
            product: '<'
        },
        link: function( scope, element, attrs ) {
            element.on( 'click', () => {                
                return ocProductChangeLog.Open( scope.product );
            } );
            scope.$on( 'destroy', () => {
                element.off( 'click' );
            } );
            element.css( 'cursor', 'pointer' );
        }
    };
}