const { ipcRenderer } = require('electron');

new Vue({
  created() {
    ipcRenderer.on('dispatch-DZC-res', (event, data) => {
      console.log(data);
      this.dispatchResult = this.dispatchResult.concat(data);
    });
  },
  data: () => ({
    dispatchResult: [],
  }),
  methods: {
    dispatchDZC() { // 下发电子称
      this.dispatchResult = [];
      ipcRenderer.invoke('dispatch-DZC');
    },
  },
  filters: {
    stringify(arr) {
      if (!Array.isArray(arr)) { return arr; }

      return arr.map(json => JSON.stringify(json)).join('\n');
    },
  },
}).$mount('#root');
