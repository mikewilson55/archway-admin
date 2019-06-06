angular.module('orderCloud')
    .filter('humanize', humanize)
;

function humanize() {
    return function(string) {
        switch (string) {            
            case 'Cancelled':
                string = 'Canceled';
            default:
                break;
        }

        if (!string) return;

        return string
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(str){ return str.toUpperCase(); })
            .trim();
    }
}