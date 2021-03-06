import Vue from 'vue'
import VModal from 'vue-js-modal/dist/ssr.nocss'

import 'vue-js-modal/dist/styles.css'

Vue.use(VModal, {
    componentName: 'modal',
    dynamicDefault: { draggable: true, resizable: true }
  }
)

/*
export default function(_, inject) {
  inject('modal', VModal)
}
*/
