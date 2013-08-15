KISSY.add('sku', function (S, DOM, Node, Event) {

    var self = this,
        $ = S.all;


    function SKU(config) {
        if (!config) {
            S.log('SKU 组件：配置为空，无法');
            return;
        }

        var map = config.skuMap,
            result = {};




        for (var key in map) {


        }


    }

    S.augment(SKU,{
        destroy: function () {
            S.log('destroyed');
        }
    });



    return SKU;
}, {requires: ['dom', 'node', 'event']});