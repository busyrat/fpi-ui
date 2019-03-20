<style lang="stylus" scoped>
.site_node
    .site_node-icon
        height 8px
        width 8px
        display inline-block
        border-radius 100%
        background gray
        margin 0 0 1px 2px
        &.active
            background #67C23A
</style>

<template>
    <div class="site_node">
        <span :class="{'site_node-icon': true, 'active': _onlineCheck()}"/>
        <span class="mgl-8">{{node[labelProp]}}</span>
    </div>
</template>

<script>
export default {
    name: 'SiteNode',

    props: {
        /**
         * 节点，也就是站点信息
         */
        node: {
            default: () => {},
            type: Object
        },

        /**
         * 用于展示的 label 字段
         */
        labelProp: {
            default: 'siteName',
            type: String
        },
        /**
         * 站点在线断线标志的判断
         * (siteInfo) => boolean
         */
        onlineCheck: {
            default: undefined,
            type: Function
        }
    },

    methods: {
        _onlineCheck() {
            let node = this.node
            if(this.onlineCheck) {
                return this.onlineCheck(node)
            } else {
                return node.status === 'online'
            }
        }
    }


}
</script>


