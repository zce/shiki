---
outline: deep
---

# @shikijs/twoslash

<Badges name="@shikijs/twoslash" />

A Shiki transformer for [Twoslash](https://github.com/twoslashes/twoslash), provide inline type hover inside code blocks.

[TwoSlash Notation Reference](https://twoslash.netlify.app/refs/notations).

## Install

```bash
npm i -D @shikijs/twoslash
```

This package is **a transformer addon** to Shiki. This means that for every integration that supports passing Shiki transformers, you can use this package.

```ts twoslash
import {
  codeToHtml,
} from 'shiki'
import {
  transformerTwoslash,
} from '@shikijs/twoslash'

const html = await codeToHtml(`console.log()`, {
  lang: 'ts',
  theme: 'vitesse-dark',
  transformers: [
    transformerTwoslash(), // <-- here
    // ...
  ],
})
```

The default output is unstyled. You need to add some extra CSS to make them look good.

If you want to run Twoslash on browsers or workers, reference to the [CDN Usage](#cdn-usage) section.

## Renderers

Thanks to the flexibility of [`hast`](https://github.com/syntax-tree/hast), this transformer allows customizing how each piece of information is rendered in the output HTML with ASTs.

We provide two renderers built-in, and you can also create your own:

---

### `rendererRich`

[Source code](https://github.com/shikijs/shiki/blob/main/packages/@shikijs/twoslash/src/renderer-rich.ts)

::: tip
This is the default renderer since v0.10.0.
:::

This renderer provides a more explicit class name is prefixed with `twoslash-` for better scoping.
In addition, it runs syntax highlighting on the hover information.

```ts twoslash
import { rendererRich, transformerTwoslash } from '@shikijs/twoslash'

transformerTwoslash({
  renderer: rendererRich() // <--
})
```

Here are a few examples with the built-in [`style-rich.css`](https://github.com/shikijs/shiki/blob/main/packages/@shikijs/twoslash/style-rich.css):

<!-- eslint-skip -->

```ts twoslash
// @errors: 2540
interface Todo {
  title: string
}

const todo: Readonly<Todo> = {
  title: 'Delete inactive users'.toUpperCase(),
//  ^?
}

todo.title = 'Hello'

Number.parseInt('123', 10)
//      ^|

               //
               //
```

```ts twoslash
import { getHighlighterCore } from 'shiki/core'

const highlighter = await getHighlighterCore({})
// @log: Custom log message
const a = 1
// @error: Custom error message
const b = 1
// @warn: Custom warning message
const c = 1
// @annotate: Custom annotation message
```

---

### `rendererClassic`

[Source code](https://github.com/shikijs/shiki/blob/main/packages/@shikijs/twoslash/src/renderer-classic.ts)

This renderer aligns with the output of [`@shikijs/twoslash`](https://shikijs.github.io/twoslash/).

```ts twoslash
import { rendererClassic, transformerTwoslash } from '@shikijs/twoslash'

transformerTwoslash({
  renderer: rendererClassic() // <--
})
```

You might need to reference `@shikijs/twoslash`'s CSS to make it look good. [Here](https://github.com/shikijs/shiki/blob/main/packages/@shikijs/twoslash/style-classic.css) we also copied the CSS from `@shikijs/twoslash` but it might need some cleanup.

### `rendererFloatingVue`

[Source code](https://github.com/shikijs/shiki/blob/main/packages/@shikijs/vitepress-twoslash/src/renderer-floating-vue.ts)

This renderer outputs Vue template syntax that using [Floating Vue](https://floating-vue.starpad.dev/) as the popup component (to render it outside the containers). This renderer is **NOT** directly usable but an internal renderer for the [VitePress integration](/packages/vitepress#twoslash). Listing it here for reference if you want to create your own renderer.

## Options

### Explicit Trigger

When integrating with `@shikijs/markdown-it` or `rehype-shiki`, we may not want Twoslash to run on every code block. In this case, we can set `explicitTrigger` to `true` to only run on code blocks with `twoslash` presented in the codeframe.

```ts twoslash
import { transformerTwoslash } from '@shikijs/twoslash'

transformerTwoslash({
  explicitTrigger: true // <--
})
```

````md
In markdown, you can use the following syntax to trigger Twoslash:

```ts
// this is a normal code block
```

```ts twoslash
// this will run Twoslash
```
````

## Integrations

While you can set up Twoslash with Shiki on your own with the instructions above, you can also find high-level integrations with frameworks and tools here:

- [VitePress](/packages/vitepress#twoslash) - A plugin to enable Twoslash support in VitePress.
- [Vocs](https://vocs.dev/docs/guides/twoslash) - Vocs has TwoSlash support built-in.
- [Slidev](https://sli.dev/custom/highlighters.html#twoslash-integration) - Slidev has TwoSlash support built-in.

## Recipes

### CDN Usage

By default `@typescript/twoslash` runs on Node.js and relies on your local system to resolve TypeScript and types for the imports. Import it directly in non-Node.js environments would not work.

Luckily, Twoslash implemented a virtual file system, which allow you to provide your own files for TypeScript to resolve in memory. However, loading these files in the browser is still a challenge. Thanks to the work on the [TypeScript WebSite](https://github.com/microsoft/TypeScript-Website), the TypeScript team has provided some utilities to fetch types on demand through CDN, they call it [Automatic Type Acquisition (ATA)](https://github.com/microsoft/TypeScript-Website/tree/v2/packages/ata).

We make tiny wrappers around the building blocks and provide an easy-to-use API in [`twoslash-cdn`](https://twoslash.netlify.app/packages/cdn). For example:

```js
// TODO: Replace with explicit versions in production
import { createTransformerFactory, rendererRich } from 'https://esm.sh/@shikijs/twoslash@latest/core'
import { codeToHtml } from 'https://esm.sh/shiki@latest'
import { createStorage } from 'https://esm.sh/unstorage@latest'
import indexedDbDriver from 'https://esm.sh/unstorage@latest/drivers/indexedb'
import { createTwoslashFromCDN } from 'https://esm.sh/twoslash-cdn@latest'

// ============= Initialization =============

// An example using unstorage with IndexedDB to cache the virtual file system
const storage = createStorage({
  driver: indexedDbDriver({ base: 'twoslash-cdn' }),
})

const twoslash = createTwoslashFromCDN({
  storage,
  compilerOptions: {
    lib: ['esnext', 'dom'],
  },
})

const transformerTwoslash = createTransformerFactory(twoslash.runSync)({
  renderer: rendererRich(),
})

// ============= Execution =============

const app = document.getElementById('app')

const source = `
import { ref } from 'vue'

console.log("Hi! Shiki + Twoslash on CDN :)")

const count = ref(0)
//     ^?
`.trim()

// Before rendering, we need to prepare the types, so that the rendering can happen synchronously
await twoslash.prepareTypes(source)

// Then we can render the code
app.innerHTML = await codeToHtml(source, {
  lang: 'ts',
  theme: 'vitesse-dark',
  transformers: [transformerTwoslash],
})
```
