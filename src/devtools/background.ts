chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'xhr-background')
    return

  port.onMessage.addListener((msg) => {
    port.postMessage({ echo: msg })
  })
})
