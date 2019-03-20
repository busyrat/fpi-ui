import components from './components'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';

import "./styles/fpi.styl"
import './styles/perfect-scrollbar.css'

import { importCSS } from './utils'

const install = function (Vue, options) {
  components.map(component => {
    Vue.component(component.name, component);
  })
  Vue.use(Element, { size: 'small' });
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
  importCSS('http://at.alicdn.com/t/font_653301_sblyj1jdu3.css')
}

export default {
  version: '0.1.0',
  install
}
