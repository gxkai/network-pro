chrome.devtools.panels.create(
  'NetworkPro2',
  '',
  'dist/panels/index.html',
  (panel) => {
    // code invoked on panel creation

    chrome.runtime.onConnect.addListener((port) => {
      if (port.name !== 'xhr-devtools')
        return
      port.postMessage({ info: 'xhr-devtools is connected' })

      chrome.devtools.network.getHAR((har) => {
        chrome.storage.local.set({ xhr: har.entries })

        port.postMessage({ getHAR: har })
      })

      chrome.devtools.network.onRequestFinished.addListener((args) => {
        port.postMessage({ onRequestFinished: args })
      })
    })
  },
)
