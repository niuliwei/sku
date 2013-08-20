/**
 *  SKU (stock keeping unit) Component
 *  @author: jianfei
 *  @email: jianfei@taobao.com
 *  @ref: http://ued.taobao.com/blog/2012/07/sku-search-algorithm/
 *
 * */

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

    function serializeSkuMap(skuMap, serializedSkuMap, self) {

        var i, j,
            keys = getKeys(skuMap),
            skuLength = self.length;

        for (i = 0; i < keys.length; i++) {
            var key = keys[i];//一条SKU信息key
            var sku = skuMap[key];    //一条SKU信息value
            var skuKeyAttrs = key.split(";"); //SKU信息key属性值数组

            var combs = combinations(skuKeyAttrs);

            j = 0;

            for (; j < skuLength; j++) {
                putResult(skuKeyAttrs[j], sku, serializedSkuMap);
            }

            for (; j < combs.length - 1; j++) {
                var tempKey = sortKeys(combs[j]).join(';');
                putResult(tempKey, sku, serializedSkuMap);
            }

            serializedSkuMap[key] = {
                stock:  sku.stock,
                prices: [sku.price]
            }
        }
    }

    function getKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
                keys.push(key);
        }
        return keys;
    }

    function getKeyLength(skuMap) {
        for (var key in skuMap) {
            return key.split(';').length;
        }
    };

    function putResult(key, sku, serializedSkuMap) {
        if (serializedSkuMap[key]) {
            serializedSkuMap[key].stock += parseInt(sku.stock);
            serializedSkuMap[key].prices.push(sku.price);
        } else {
            serializedSkuMap[key] = {
                stock:  parseInt(sku.stock),
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
        });

        for (i = 0; i < keys.length; i++) {
            keys[i] = holder[keys[i]];
        }

        return keys;

    }


    var defConfig = {
        _required:        ['root', 'skuMap'],
        root:             null,
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

        S.each(self.config._required, function (req) {
            if (!self.config[req]) {
                throw 'SKU：缺少配置项 ' + req;
            }
        });

        self.config.skuMap = normalizeSkuMap(self.config.skuMap);

        var skuMap = self.config.skuMap,
            serializedSkuMap = self.config.serializedSkuMap;

        self.length = getKeyLength(skuMap); // SKU 实例的长度
        self.lastSelectedLength = 0;

        self.uid = S.guid();

        var ROOT = self.config.root,
            SELECTED_CLS = self.config.selectedClass,
            DISABLED_CLS = self.config.disabledClass,
            SKU_CLS = self.config.skuClass,
            ATTR_NAME = self.config.attrName;

        serializeSkuMap(skuMap, serializedSkuMap, self);

        S.all('.' + SKU_CLS, ROOT).on('click', function (evt) {

            var target = S.one(evt.currentTarget);

            if (target.hasClass(DISABLED_CLS)) {
                return;
            }

            target.toggleClass(SELECTED_CLS).siblings().removeClass(SELECTED_CLS);

            var selectedObjs = S.all('.' + SELECTED_CLS, ROOT),
                selectedLength = selectedObjs.length,
                selectedIds = [];

            if (selectedLength) {
                selectedObjs.each(function (el) {
                    selectedIds.push(el.attr(ATTR_NAME));
                });

                selectedIds = sortKeys(selectedIds);
                var len = selectedIds.length;
                var prices = serializedSkuMap[selectedIds.join(';')].prices;
                var maxPrice = Math.max.apply(Math, prices);
                var minPrice = Math.min.apply(Math, prices);

                // $('#price').text(maxPrice > minPrice ? minPrice + "-" + maxPrice : maxPrice);

                S.all("." + SKU_CLS, ROOT).each(function (el) {

                    if (S.inArray(el[0], selectedObjs) || el[0] === target[0]) {
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
                S.all('.' + SKU_CLS, ROOT).each(function (el) {
                    el = S.one(el);
                    serializedSkuMap[el.attr(ATTR_NAME)] ?
                    el.removeClass(DISABLED_CLS) : $el.addClass(DISABLED_CLS).removeClass(SELECTED_CLS);
                })
            }
            self.check(selectedIds);
        });


    }

    S.augment(SKU, {
        station: S.mix({}, S.EventTarget),

        broadcast: function (data) {
            data = S.merge(data, { id: this.uid});
            this.station.fire(data);
            S.log(data);
        },


        check: function (selectedIds) {

            var selectedLength = selectedIds.length;
            this.broadcast({
                               news:      'selectionChanged',
                               selection: selectedIds
                           });

            if (selectedLength === this.length) {
                this.broadcast({
                                   news: 'skuFound',
                                   sku:  this.config.skuMap[selectedIds.join(';')]
                               })
            }

            if (this.lastSelectedLength === this.length) {
                this.broadcast({news: 'skuLost'});
            }

            this.lastSelectedLength = selectedLength;
        },


        destroy: function () {
            // TODO
        }

    });

    return SKU;

}, {requires: ['dom', 'node', 'event']});