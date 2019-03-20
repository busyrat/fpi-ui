<style lang="stylus" scoped>
.i-tree >>>
    position relative
    padding-top 40px
    .i-tree-search
        width 100%
        position absolute
        top 8px
        padding 0 8px
    .el-tree-node.is-current
        & > .el-tree-node__content
            background #F2F6FC
            color #409EFF
        
    .icon-folder
        color #64c9f7
</style>


<template lang="pug">
    div.i-tree
        el-input.i-tree-search(
            placeholder="输入关键字进行过滤"
            v-model="filterText"
        )
        el-tree(
            ref="elTree"
            :data="data"
            node-key="iTreeNodeKey"
            default-expand-all
            :render-content="renderContent"
            @node-click="nodeClick"
            :filter-node-method="onFilter"
        )
</template>


<script>
/**
 * 
 * ITree 组件，全局使用的树菜单封装
 * 支持：默认值；渲染自定义的 attached（附加）节点；对外暴露点击事件，返回 node 数据
 */
import SiteNode from './SiteNode.vue'
export default {
    name: 'FpiTree',

    props: {
        //数据源， 会经过 transform 变成 localData
        data: {
            default: () => demoData,
            type: Array
        },
        options: {
            default: () => ({/* defaultDataOption */ }),
            type: Object
        },
        /**
         * 渲染附属节点的函数，注意，函数内部使用 jsx 语法实现
         * (h, data) => jsx-element
         */
        renderAttachedNode: {
            type: Function,
            default: undefined
        },
        /**
         * 节点点击时候的回调函数
         * (data) => void
         */
        onNodeClick: {
            type: Function,
            default: () => {}
        },
        /** 
         * 默认选中的节点 key，和 options.keyProp 有关
         * 备选关键词:
         *      treeAttached:       attached 第一个
         *      treeRoot:           整个树 第一个      
         *      treeChildren        children 第一个
         * 
         */     
        defaultSelectedKey: {
            default: null,
            type: String
        }
    },
      
    data() {
        return {
            localData: [],
            filterText: '',
            selectedNode: undefined,
        }
    },

    computed: {
        defaultDataOption() {
            const defaultOption = {
                //表示子节点数组的字段
                childrenProp: 'children',
                //表示附属节点数组的字段
                attachedProp: 'sites',
                //表示节点的名称
                nodeLabelProp: 'label',
                //表示附属节点的名称
                attachedLabelProp: 'siteName',
                //给node-key使用
                keyProp: 'id|ID|Id'
            } 
            return { ...defaultOption, ...this.options }
        }
    },

    watch: {
        filterText(val) {
            this.$refs.elTree.filter(val);
        }
    },
    methods: {
        renderContent(h, scope) {
            //前方高能，属于是 jsx 语法，但是和 react 用的又不太一样，emm...
            //@see: https://github.com/vuejs/babel-plugin-transform-vue-jsx
            return (
                <div>
                    {
                        scope.data.isAttached
                        ? this._renderAttachedNode(h, scope.data)
                        : (
                            <div>
                                <i class="iconfont icon-folder"/>
                                <span class="mgl-8">{scope.data[this.defaultDataOption.nodeLabelProp]}</span>
                            </div>
                        )
                    }
                    
                </div>
            )
        },
        nodeClick(data) {
            if(data.isAttached) {
                console.log('[i-tree]:', 'attached node be clicked')
            } else {
                console.log('[i-tree]:', 'normal node be clicked')
            }
            this.$emit('onNodeClick', data)
        },
        /**
         * 使用 nodeLabelProp 和 attachedLabelProp 两个属性的值作为 node 的唯一性字段
         * 有可能会造成重复
         */
        transformSourceData() {
            const { attachedProp, childrenProp, attachedLabelProp, nodeLabelProp } = this.defaultDataOption
            let recursive = (list) => {
                if(list && list.length > 0) {
                    list.map(node => {
                        let attachedList = node[attachedProp]
                        let childrenList = node[childrenProp]
                        //增加唯一标示的nodekey
                        node.iTreeNodeKey = node[this.getKey(node)]
                        if(childrenList && childrenList.length > 0) {
                            // 设置第一个 children 为默认选中
                            if (this.defaultSelectedKey === 'treeChildren') {
                                this.setSelectedNode(childrenList[0])
                            }
                            recursive(childrenList)
                        }
                        if(attachedList && attachedList.length > 0) {
                            attachedList = attachedList.map(addIsAttachedProp)
                            node[childrenProp] = (childrenList || []).concat(attachedList)
                            // 设置第一个 attached 为默认选中
                            if (this.defaultSelectedKey === 'treeAttached') {
                                this.setSelectedNode(attachedList[0])
                            }
                        }
                    })
                }
            }

            const addIsAttachedProp = node => {
                return {...node, isAttached: true, iTreeNodeKey: node[this.getKey(node)] }
            }

            recursive.call(this, this.data)
            // 设置树结构第一个节点为默认选中
            if (this.defaultSelectedKey === 'treeRoot') {
                this.setSelectedNode(this.data[0])
            }

            this.localData = this.data
        },
        onFilter(currentSearchText, data) {
            const { nodeLabelProp, attachedLabelProp, childrenProp } = this.defaultDataOption
            if((data[nodeLabelProp] || data[attachedLabelProp]).indexOf(currentSearchText) !== -1) {
                return true
            }
            return false
        },
        /**
         * 渲染附属节点的方法，默认按照站点的信息来进行渲染
         * 其中，站点选中状态的判断，在不同系统里面自行处理
         */
        _renderAttachedNode(h, attachedNode) {
            return this.renderAttachedNode
                    ? this.renderAttachedNode(h, attachedNode)
                    : (
                        <SiteNode node={attachedNode}/>
                    )
        },
        getKey(node) {
            return this.defaultDataOption.keyProp.split('|').filter(key => node[key] ? key : false )
        },
        setSelectedNode(node) {
            if (this.selectedNode) return
            this.selectedNode = node
        }
    },

    beforeMount() {
        this.transformSourceData()

    },

    mounted() {
        this.$nextTick(() => {
            /**
             * 使用默认选中的 key 来初始化展示，这个 key 的取值，对于 children 和 attched 节点来说
             * 这个和 keyProp 有关
             */
            this.$refs.elTree.setCurrentKey(this.selectedNode ? this.selectedNode[this.getKey(this.selectedNode)] : this.defaultSelectedKey)
            this.selectedNode && this.$emit('onDefaultSelected', this.selectedNode)
        })
    }
}

const demoData = [{
    id: 1,
    label: '一级 1',
    sites: [{
            siteName: '站点 1',
            status: 'online'
        },{
            siteName: '站点 2',
            status: 'offline'
        }],
        children: [{
            id: 9,
            label: '三级 1-1-1'
        }, {
            id: 10,
            label: '三级 1-1-2'
        }],
    children: [{
        id: 4,
        label: '二级 1-1',
        sites: [{
            siteName: '站点 1',
            status: 'online'
        },{
            siteName: '站点 2',
            status: 'offline'
        }],
        children: [{
            id: 9,
            label: '三级 1-1-1'
        }, {
            id: 10,
            label: '三级 1-1-2'
        }]
    }]
}, {
    id: 2,
    label: '一级 2',
    children: [{
        id: 5,
        label: '二级 2-1'
    }, {
        id: 6,
        label: '二级 2-2'
    }]
}, {
    id: 3,
    label: '一级 3',
    children: [{
        id: 7,
        label: '二级 3-1'
    }, {
        id: 8,
        label: '二级 3-2',
        children: [{
            id: 11,
            label: '三级 3-2-1'
        }, {
            id: 12,
            label: '三级 3-2-2'
        }, {
            id: 13,
            label: '三级 3-2-3'
        }]
    }]
}]
</script>