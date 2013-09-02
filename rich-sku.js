(function (S) {
    S.add('rich-sku', function (S, RichBase, Node) {

        var proto = {
                constructor:     function () {

                    var self = this;

                    SKU.superclass.constructor.apply(self, arguments);

                    S.each(self.get('_required'), function (req) {
                        if (!self.get(req)) {
                            throw 'SKU：缺少配置项 ' + req;
                        }
                    });

                    self.normalizeSkuMap();
                    self.serializeSkuMap();
                    self.setLength();

                    var SELECTED_CLS = self.get('selectedClass'),
                        DISABLED_CLS = self.get('disabledClass'),
                        SKU_CLS = self.get('skuClass'),
                        ATTR_NAME = self.get('attrName'),
                        serializedSkuMap = self.get('serializedSkuMap'),
                        ROOT = self.get('root'),
                        PARTICLES = S.all('.' + SKU_CLS, ROOT);


                    PARTICLES.on('click', function (evt) {

                        var target = S.one(evt.currentTarget);

                        if (target.hasClass(DISABLED_CLS)) {
                            return;
                        }

                        target.toggleClass(SELECTED_CLS).siblings().removeClass(SELECTED_CLS);

                        var selectedPtcl = S.all('.' + SELECTED_CLS, ROOT),
                            selectedLength = selectedPtcl.length,
                            selectedIds = [];

                        if (!selectedLength) {
                            PARTICLES.each(function (el) {
                                serializedSkuMap[el.attr(ATTR_NAME)] ?
                                el.removeClass(DISABLED_CLS) : el.addClass(DISABLED_CLS).removeClass(SELECTED_CLS);
                            })
                        } else {
                            selectedPtcl.each(function (el) {
                                selectedIds.push(el.attr(ATTR_NAME));
                            });

                            selectedIds = self.sortKeys(selectedIds);
                            var len = selectedIds.length;
                            var prices = serializedSkuMap[selectedIds.join(';')].prices;
//                            var maxPrice = Math.max.apply(Math, prices);
//                            var minPrice = Math.min.apply(Math, prices);

                            PARTICLES.each(function (el) {

                                if (S.inArray(el[0], selectedPtcl) || el[0] === target[0]) {
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
                                testAttrIds = self.sortKeys(testAttrIds);
                                if (!serializedSkuMap[testAttrIds.join(';')]) {
                                    el.addClass(DISABLED_CLS).removeClass(SELECTED_CLS);
                                } else {
                                    el.removeClass(DISABLED_CLS);
                                }
                            });
                        }
                        self.check(selectedIds, selectedPtcl);
                    });

                },
                k_combinations:  function (set, k) {
                    var self = this;
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
                        tailcombs = self.k_combinations(set.slice(i + 1), k - 1);
                        for (j = 0; j < tailcombs.length; j++) {
                            combs.push(head.concat(tailcombs[j]));
                        }
                    }
                    return combs;
                },
                combinations:    function (set) {
                    var self = this;
                    var k, i, combs, k_combs;
                    combs = [];

                    // Calculate all non-empty k-combinations
                    for (k = 1; k <= set.length; k++) {
                        k_combs = self.k_combinations(set, k);
                        for (i = 0; i < k_combs.length; i++) {
                            combs.push(k_combs[i]);
                        }
                    }
                    return combs;
                },
                normalizeSkuMap: function () {
                    var self = this,
                        skuMap = self.get('skuMap'),
                        newSkuMap = {},
                        key;
                    for (key in skuMap) {
                        var newKey = key.replace(/^;|;$/gi, '');
                        newSkuMap[newKey] = skuMap[key];
                    }
                    self.set('skuMap', newSkuMap);
                },
                serializeSkuMap: function () {

                    var self = this,
                        skuMap = self.get('skuMap'),
                        serializedSkuMap = {};

                    var i, j,
                        keys = self.getKeys(),
                        skuLength = self.length;

                    for (i = 0; i < keys.length; i++) {
                        var key = keys[i];//一条SKU信息key
                        var sku = skuMap[key];    //一条SKU信息value
                        var skuKeyAttrs = key.split(";"); //SKU信息key属性值数组

                        var combs = self.combinations(skuKeyAttrs);

                        j = 0;

                        for (; j < skuLength; j++) {
                            this.putResult(skuKeyAttrs[j], sku, serializedSkuMap);
                        }

                        for (; j < combs.length - 1; j++) {
                            var tempKey = self.sortKeys(combs[j]).join(';');
                            this.putResult(tempKey, sku, serializedSkuMap);
                        }

                        serializedSkuMap[key] = {
                            stock:  sku.stock,
                            prices: [sku.price]
                        };

                        self.set('serializedSkuMap', serializedSkuMap);


                    }
                },

                getKeys:   function () {

                    var self = this,
                        skuMap = self.get('skuMap'),
                        keys = [];

                    for (var key in skuMap) {
                        if (Object.prototype.hasOwnProperty.call(skuMap, key))
                            keys.push(key);

                    }
                    return keys;
                },
                setLength: function () {
                    var self = this,
                        skuMap = self.get('skuMap');

                    var length = (function (m) {
                        for (var k in m) {
                            return k.split(';').length;
                        }
                    })(skuMap);

                    self.set('length', length);
                    self.set('lastSelectedLength', 0);

                },
                sortKeys:  function (keys) {

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

                },
                putResult: function (key, sku, serializedSkuMap) {
                    if (serializedSkuMap[key]) {
                        serializedSkuMap[key].stock += parseInt(sku.stock);
                        serializedSkuMap[key].prices.push(sku.price);
                    } else {
                        serializedSkuMap[key] = {
                            stock:  parseInt(sku.stock),
                            prices: [sku.price]
                        };
                    }
                },
                station:   S.mix({}, S.EventTarget),

                broadcast: function (event, data) {

                    data = S.merge(data, { uid: this.uid});
                    this.station.fire(event, data);
                    S.log(event, data);

                },

                subscribe: function (event, callback) {

                    var self = this;

                    event = event.split(' ');

                    S.each(event, function (evt) {
                        self.station.on(evt, callback);
                    });
                },

                check: function (selectedIds, selectedObjs) {

                    var self = this,
                        length = self.get('length'),
                        lastSelectedLength = self.get('lastSelectedLength'),
                        skuMap = self.get('skuMap');

                    var selectedLength = selectedIds.length;
                    self.broadcast('selectionChanged', {
                        selection: selectedIds,
                        particles: selectedObjs
                    });

                    if (selectedLength === length && lastSelectedLength === length) {
                        self.broadcast('skuChanged', {
                            sku: skuMap[selectedIds.join(';')]
                        });
                    } else if (selectedLength === length) {
                        self.broadcast('skuFound', {
                            sku: skuMap[selectedIds.join(';')]
                        })
                    } else if (lastSelectedLength === length) {
                        self.broadcast('skuLost');
                    }

                    self.set('lastSelectedLength', selectedLength);
                },

                destroy: function () {
                    // TODO
                }

            },


            attrs = {
                ATTRS: {
                    _required:        {
                        value: ['root', 'skuMap']
                    },
                    root:             {
                        value: null
                    },
                    skuClass:         {
                        value: 'J_TSKU'
                    },
                    selectedClass:    {
                        value: 'selected'
                    },
                    disabledClass:    {
                        value: 'disabled'
                    },
                    attrName:         {
                        value: 'data-value'
                    },
                    skuMap:           {
                        value: null
                    },
                    serializedSkuMap: {
                        value: {}
                    },
                    uid:              {
                        value: S.guid()
                    }
                }
            };


        var SKU = RichBase.extend(proto, attrs);

        return SKU;


    }, {requires: ['rich-base', 'node']})
})(KISSY);