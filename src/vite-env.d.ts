/// <reference types="vite/client" />

declare module '*.sfce.vue' {
  const customElement: CustomElementConstructor
  export default customElement
}
