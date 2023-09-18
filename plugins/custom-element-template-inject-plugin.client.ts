/// <reference types="vite/client" />

if (import.meta.hot) {
  import.meta.hot.on(
    'custom-element-template-inject-plugin:update',
    (templates) => {
      for (const t of templates) {
        const el = document.getElementById(t.id)
        if (el) {
          el.innerHTML = t.content
        } else {
          const templateEl = document.createElement('template')
          templateEl.id = t.id
          templateEl.innerHTML = t.content
          document.body.append(templateEl)
        }
      }
    },
  )
}
