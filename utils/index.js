export const importCSS = (url) => {
    let link = window.document.createElement("link")
    link.type = 'text/css'
    link.rel="stylesheet"
    link.href = url
    window.document.getElementsByTagName('head')[0].appendChild(link)
}
