import components from './components'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

const install = function (Vue, options) {
  components.map(component => {
    Vue.component(component.name, component);
  })
  Vue.use(Element)
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  version: '0.1.0',
  install
}
