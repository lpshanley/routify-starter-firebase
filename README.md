# routify-starter-firebase

Starter template for [Routify](https://github.com/sveltech/routify)

### Get started

To use this starter run 
```bash
npx degit lpshanley/routify-starter-firebase routify-starter
cd routify-starter
npm i
cd functions
npm i
cd ..
```


Alternatively, you can clone this repo.

### Npm scripts

| Syntax           | Description                                                                       |
|------------------|-----------------------------------------------------------------------------------|
| `dev`            | Development (port 5000)                                                           |
| `dev-dynamic`    | Development with dynamic imports                                                  |
| `build`          | Build a bundled app with SSR + ~~pre-rendering~~* and dynamic imports              |
| `serve`          | Run after a build to preview. Serves SSR on 5000                                  |
| `deploy:firebase`| Deploy to firebase                                                                |

### SSR and ~~pre-rendering~~*

SSR and ~~pre-rendering~~* are included in the default build process.

`npm run deploy:firebase` will deploy the app with SSR and ~~pre-rendering~~* included.

To render async data, call the `$ready()` helper whenever your data is ready.

If $ready() is present, rendering will be delayed till the function has been called.

Otherwise it will be rendered instantly.

See [src/pages/example/api/[showId].svelte](https://github.com/sveltech/routify-starter/blob/master/src/pages/example/api/%5BshowId%5D.svelte) for an example.

### Production

* Make sure you have `firebase-tools` installed and are logged in.
* Add your project-id in the .firebaserc file.
* Run `npm run deploy:firebase`

### Notes
\* At the moment use of prerendering prevents use of SSR. I am working on a possible solution for conditional prerendering.

### Issues?

File on Github! See https://github.com/lpshanley/routify-starter-firebase/issues.