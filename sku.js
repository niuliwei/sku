KISSY.add('sku', function (S, DOM, Node, Event) {


    /**
     * K-combinations
     *
     * Get k-sized combinations of elements in a set.
     *
     * Usage:
     *   k_combinations(set, k)
     *
     * Parameters:
     *   set: Array of objects of any type. They are treated as unique.
     *   k: size of combinations to search for.
     *
     * Return:
     *   Array of found combinations, size of a combination is k.
     *
     * Examples:
     *
     *   k_combinations([1, 2, 3], 1)
     *   -> [[1], [2], [3]]
     *
     *   k_combinations([1, 2, 3], 2)
     *   -> [[1,2], [1,3], [2, 3]
     *
     *   k_combinations([1, 2, 3], 3)
     *   -> [[1, 2, 3]]
     *
     *   k_combinations([1, 2, 3], 4)
     *   -> []
     *
     *   k_combinations([1, 2, 3], 0)
     *   -> []
     *
     *   k_combinations([1, 2, 3], -1)
     *   -> []
     *
     *   k_combinations([], 0)
     *   -> []
     */
    function k_combinations(set, k) {
        var i, j, combs, head, tailcombs;

        if (k > set.length || k <= 0) {
            return [];
        }

        if (k == set.length) {
            return [set];
        }

        if (k == 1) {
            combs = [];
            for (i = 0; i < set.length; i++) {
                combs.push([set[i]]);
            }
            return combs;
        }

        // Assert {1 < k < set.length}

        combs = [];
        for (i = 0; i < set.length - k + 1; i++) {
            head = set.slice(i, i + 1);
            tailcombs = k_combinations(set.slice(i + 1), k - 1);
            for (j = 0; j < tailcombs.length; j++) {
                combs.push(head.concat(tailcombs[j]));
            }
        }
        return combs;
    }


    /**
     * Combinations
     *
     * Get all possible combinations of elements in a set.
     *
     * Usage:
     *   combinations(set)
     *
     * Examples:
     *
     *   combinations([1, 2, 3])
     *   -> [[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]]
     *
     *   combinations([1])
     *   -> [[1]]
     */
    function combinations(set) {
        var k, i, combs, k_combs;
        combs = [];

        // Calculate all non-empty k-combinations
        for (k = 1; k <= set.length; k++) {
            k_combs = k_combinations(set, k);
            for (i = 0; i < k_combs.length; i++) {
                combs.push(k_combs[i]);
            }
        }
        return combs;
    }


    function normalizeSkuMap(skuMap) {
        var newSkuMap = {};
        for (var key in skuMap) {
            var newKey = key.replace(/^;|;$/gi, '');
            newSkuMap[newKey] = newSkuMap[key];
        }
        return newSkuMap;
    }


    var defConfig = {
        skuClass:      'J_TSKU',
        selectedClass: 'selected',
        disabledClass: 'disabled'
    };


    function SKU(cfg) {
        if (!cfg) {
            S.log('SKU 组件：配置为空，无法初始化');
            return;
        }

        var config = S.merge(defConfig, cfg);

        var SELECTED_CLS = config.selectedClass,
            DISABLED_CLS = config.disabledClass;


        var skuMap = config.skuMap;


//测试结果集

        skuMap = normalizeSkuMap(skuMap);
//保存最后的组合结果信息
        var SKUResult = {};


//获得对象的key
        function getObjKeys(obj) {
            if (obj !== Object(obj)) throw new TypeError('Invalid object');
            var keys = [];
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                    keys[keys.length] = key;
            }
            return keys;
        }

//把组合的key放入结果集SKUResult
        function add2SKUResult(key, sku) {
            if (SKUResult[key]) {//SKU信息key属性·
                SKUResult[key].count += sku.count;
                SKUResult[key].prices.push(sku.price);
            } else {
                SKUResult[key] = {
                    count:  sku.count,
                    prices: [sku.price]
                };
            }
        }

        // Sort keys in
        function sortKeys(arr) {
            var holder = {}
            for (var i = 0; i < arr.length; i++) {
                var key = arr[i], newKey = key.replace(';');
                holder[newKey] = key;
                arr[i] = newKey;
            }
            arr.sort(function (a, b) {
                return parseInt(a) - parseInt(b);
            })
            for (var i = 0; i < arr.length; i++) {
                arr[i] = holder[arr[i]];
            }

            return arr;

        }

//对一条SKU信息进行拆分组合
        function combineSKU(skuKeyAttrs, cnum, sku) {
            var len = skuKeyAttrs.length;
            for (var i = 0; i < len; i++) {
                var key = skuKeyAttrs[i];
                for (var j = i + 1; j < len; j++) {
                    if (j + cnum <= len) {
                        var tempArr = skuKeyAttrs.slice(j, j + cnum);
                        tempArr = sortKeys(tempArr);
                        //安装组合个数获得属性值·
                        var genKey = key + ";" + tempArr.join(";");    //得到一个组合key

                        add2SKUResult(genKey, sku);
                    }
                }
            }
        }

//初始化得到结果集
        function initSKU() {
            var i, j, skuKeys = getObjKeys(skuMap);
            for (i = 0; i < skuKeys.length; i++) {
                var skuKey = skuKeys[i];//一条SKU信息key
                var sku = skuMap[skuKey];    //一条SKU信息value
                var skuKeyAttrs = skuKey.split(";"); //SKU信息key属性值数组
                var len = skuKeyAttrs.length;


                var combs = combinations(skuKeyAttrs);


                var j = 0;
                for (; j < len; j++) {
                    add2SKUResult(skuKeyAttrs[j], sku);
                }

                for (; j < combs.length - 1; j++) {
                    var genKey = sortKeys(combs[j]).join(';');
                    add2SKUResult(genKey, sku);
                }

                //结果集接放入SKUResult
                SKUResult[skuKey] = {
                    count:  sku.count,
                    prices: [sku.price]
                }
            }
        }

//初始化用户选择事件
        $(function () {
            initSKU();
            $('.J_TSKU').each(function () {
                var self = $(this);
                var attr_id = self.attr('data-value');
                if (!SKUResult[attr_id]) {
                    self.attr(DISABLED_CLS, DISABLED_CLS);
                }
            }).click(function () {
                         var self = $(this);

                         if ($(this).hasClass(DISABLED_CLS)) {
                             return;
                         }

                         // 切换被点击SKU 的class，去除其所在属性其它的sku 的 class
                         self.toggleClass(SELECTED_CLS).siblings().removeClass(SELECTED_CLS);

                         var selectedObjs = $('.selected');
                         if (selectedObjs.length) {
                             //获得组合key价格
                             var selectedIds = [];
                             selectedObjs.each(function () {
                                 selectedIds.push($(this).attr('data-value'));
                             });
                             /*
                              selectedIds.sort(function(value1, value2) {
                              return parseInt(value1) - parseInt(value2);
                              });*/
                             selectedIds = sortKeys(selectedIds);
                             var len = selectedIds.length;
                             var prices = SKUResult[selectedIds.join(';')].prices;
                             var maxPrice = Math.max.apply(Math, prices);
                             var minPrice = Math.min.apply(Math, prices);
                             $('#price').text(maxPrice > minPrice ? minPrice + "-" + maxPrice : maxPrice);

                             //用已选中的节点验证待测试节点 underTestObjs
                             $(".J_TSKU").not(selectedObjs).not(self).each(function () {
                                 var siblingsSelectedObj = $(this).siblings('.selected');
                                 var testAttrIds = [];//从选中节点中去掉选中的兄弟节点
                                 if (siblingsSelectedObj.length) {
                                     var siblingsSelectedObjId = siblingsSelectedObj.attr('data-value');
                                     for (var i = 0; i < len; i++) {
                                         (selectedIds[i] != siblingsSelectedObjId) && testAttrIds.push(selectedIds[i]);
                                     }
                                 } else {
                                     testAttrIds = selectedIds.concat();
                                 }
                                 testAttrIds = testAttrIds.concat($(this).attr('data-value'));
                                 /*testAttrIds.sort(function(value1, value2) {
                                  return parseInt(value1) - parseInt(value2);
                                  });*/
                                 testAttrIds = sortKeys(testAttrIds);
                                 if (!SKUResult[testAttrIds.join(';')]) {
                                     $(this).addClass(DISABLED_CLS).removeClass(SELECTED_CLS);
                                 } else {
                                     $(this).removeClass(DISABLED_CLS);
                                 }
                             });
                         } else {
                             //设置默认价格
                             $('#price').text('--');
                             //设置属性状态
                             $('.J_TSKU').each(function () {
                                 SKUResult[$(this).attr('data-value')] ? $(this).removeClass(DISABLED_CLS) : $(this).addClass(DISABLED_CLS).removeClass(SELECTED_CLS);
                             })
                         }
                     });
        });


    }

    S.augment(SKU, {
        destroy: function () {
            S.log('destroyed');
        }
    });


    return SKU;
}, {requires: ['dom', 'node', 'event']});