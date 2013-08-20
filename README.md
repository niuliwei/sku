## 通用 SKU 选择器

### 调用方法与配置项
```javascript
KISSY.use('sku', function(S, SKU){
    var sku = new SKU({
    root:          '#sku',       // SKU 区块的根节点
    skuClass:      'J_TSKU',        // SKU 颗粒节点 class
    selectedClass: 'selected',      // 选中的 SKU 颗粒节点 class
    disabledClass: 'disabled',      // 禁用的 SKU 颗粒节点 class
    attrName:      'data-value',    // SKU 节点上记录 ID 的属性名称
	});
})
```
### 自定义事件的数据：

* ``` selectionChanged ```：
    * 触发机制：用户点击引起的颗粒状态变化
    * 自定义事件对象结构：
        * ```news```: ``` 'selectionChanged' ```
        * ```selection ``` : 当前选中的 SKU 颗粒的 ID
* ``` skuFound ```：
    * 触发机制：匹配到 SKU 记录
    * 自定义事件对象结构：
       * ```news ``` : ``` skuFound ```
       * ```sku``` : SKU 对象

* ``` skuLost ```：
    * 触发机制：SKU 匹配失败
    * 自定义事件对象结构：
        * ```news```: 'skuLost'
        
所有的自定义事件对象均有 id 字段，值为 SKU 实例的唯一 ID
       