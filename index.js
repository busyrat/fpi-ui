import Hello from "./components/hello"

const components = [
  Hello
]

const install = function (Vue, options) {
  components.map(component => {
    Vue.component(component.name, component);
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default {
  version: '0.1.0',
  install
}
