KISSY.add('sku', function (S, DOM, Node, Event) {


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
            newSkuMap[newKey] = skuMap[key];
        }
        return newSkuMap;
    }

    function serializeSkuMap(skuMap, serializedSkuMap) {
        var i, keys = getKeys(skuMap);
        for (i = 0; i < keys.length; i++) {
            var key = keys[i];//一条SKU信息key
            var sku = skuMap[key];    //一条SKU信息value
            var skuKeyAttrs = key.split(";"); //SKU信息key属性值数组
            var len = skuKeyAttrs.length;

            var combs = combinations(skuKeyAttrs);

            var j = 0;
            for (; j < len; j++) {
                putResult(skuKeyAttrs[j], sku, serializedSkuMap);
            }

            for (; j < combs.length - 1; j++) {
                var tempKey = sortKeys(combs[j]).join(';');
                putResult(tempKey, sku, serializedSkuMap);
            }

            serializedSkuMap[key] = {
                count:  sku.count,
                prices: [sku.price]
            }
        }
    }

    //获得对象的key
    function getKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
                keys.push(key);
        }
        return keys;
    }

//把组合的key放入结果集SKUResult
    function putResult(key, sku, serializedSkuMap) {
        if (serializedSkuMap[key]) {
            serializedSkuMap[key].count += sku.count;
            serializedSkuMap[key].prices.push(sku.price);
        } else {
            serializedSkuMap[key] = {
                count:  sku.count,
                prices: [sku.price]
            };
        }
    }

    function sortKeys(keys) {
        var holder = {},
            i, key, newKey;

        for (i = 0; i < keys.length; i++) {
            key = keys[i];
            newKey = key.replace(';');
            holder[newKey] = key;
            keys[i] = newKey;
        }
        keys.sort(function (a, b) {
            return parseInt(a) - parseInt(b);
        })
        for (i = 0; i < keys.length; i++) {
            keys[i] = holder[keys[i]];
        }

        return keys;

    }


    var defConfig = {
        skuClass:         'J_TSKU',
        selectedClass:    'selected',
        disabledClass:    'disabled',
        attrName:         'data-value',
        skuMap:           null,
        serializedSkuMap: {}
    };


    function SKU(cfg) {

        if (!cfg) {
            S.log('SKU: 配置为空，无法初始化');
            return;
        }

        var self = this;

        self.config = S.merge(defConfig, cfg);

        var SELECTED_CLS = self.config.selectedClass,
            DISABLED_CLS = self.config.disabledClass,
            SKU_CLS = self.config.skuClass,
            ATTR_NAME = self.config.attrName;


        var skuMap = self.config.skuMap,
            serializedSkuMap = self.config.serializedSkuMap;

        if (!skuMap) {
            return S.log('SKU: skuMap 为空，无法初始化');
        }


        skuMap = normalizeSkuMap(skuMap);

        serializeSkuMap(skuMap, serializedSkuMap);

        S.all('.' + SKU_CLS).on('click', function (evt) {

            var self = S.one(evt.currentTarget);

            if (self.hasClass(DISABLED_CLS)) {
                return;
            }

            self.toggleClass(SELECTED_CLS).siblings().removeClass(SELECTED_CLS);

            var selectedObjs = S.all('.' + SELECTED_CLS);

            if (selectedObjs.length) {
                var selectedIds = [];
                selectedObjs.each(function (el) {
                    selectedIds.push(el.attr(ATTR_NAME));
                });

                selectedIds = sortKeys(selectedIds);
                var len = selectedIds.length;
                var prices = serializedSkuMap[selectedIds.join(';')].prices;
                var maxPrice = Math.max.apply(Math, prices);
                var minPrice = Math.min.apply(Math, prices);

                // $('#price').text(maxPrice > minPrice ? minPrice + "-" + maxPrice : maxPrice);

                S.all("." + SKU_CLS).each(function (el) {

                    if (S.inArray(el[0], selectedObjs) || el[0] === self[0]) {
                        return;
                    }

                    var siblingsSelectedObj = el.siblings('.' + SELECTED_CLS),
                        testAttrIds = [];

                    if (siblingsSelectedObj.length) {
                        var siblingsSelectedObjId = siblingsSelectedObj.attr(ATTR_NAME);
                        for (var i = 0; i < len; i++) {
                            (selectedIds[i] != siblingsSelectedObjId) && testAttrIds.push(selectedIds[i]);
                        }
                    } else {
                        testAttrIds = selectedIds.concat();
                    }
                    testAttrIds = testAttrIds.concat(el.attr(ATTR_NAME));
                    testAttrIds = sortKeys(testAttrIds);
                    if (!serializedSkuMap[testAttrIds.join(';')]) {
                        el.addClass(DISABLED_CLS).removeClass(SELECTED_CLS);
                    } else {
                        el.removeClass(DISABLED_CLS);
                    }
                });
            } else {
                S.all('.' + SKU_CLS).each(function (el) {
                    el = S.one(el);
                    serializedSkuMap[el.attr(ATTR_NAME)] ?
                    el.removeClass(DISABLED_CLS) : $el.addClass(DISABLED_CLS).removeClass(SELECTED_CLS);
                })
            }
        });


    }

    S.augment(SKU, {
        destroy: function () {
            S.log('destroyed');
        }
    });

    return SKU;
}, {requires: ['dom', 'node', 'event']});