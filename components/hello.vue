<style lang="stylus" scoped>
.hello
    color #003A89
</style>

<template lang="pug">
.hello hello {{msg}}

</template>

<script>
export default {
    name: 'FpiHello',
    props: {
        msg: String
    }
}
</script>
