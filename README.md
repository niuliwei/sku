## 通用 SKU 选择器

### 调用方法与配置项
```javascript
KISSY.use('sku', function(S, SKU){
    var sku = new SKU({
    root: '#sku', // SKU 区块的根节点
    skuClass:      'J_TSKU', // SKU 节点 class
    selectedClass: 'selected',// 选中的 SKU 节点 class
    disabledClass: 'disabled',  // 禁用的 SKU 节点 class
    attrName:      'data-value', // SKU 节点上记录 ID 的属性名称
	});
})
```
