KISSY.add('sku', function (S, DOM, Node, Event) {

    var self = this,
        $ = S.all;


    function SKU(config) {
        if (!config) {
            S.log('SKU 组件：配置为空，无法');
            return;
        }

    }

    return {
        destroy: function () {
            alert("I'm destroyed... ~_~");
        }
    }
}, {requires: ['dom', 'node', 'event']});