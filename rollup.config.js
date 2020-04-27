import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy'
import del from 'del'

const staticDir = 'static'

const distDir = 'functions/dist'
const buildDir = `${staticDir}/build`

const production = !process.env.ROLLUP_WATCH;
const bundling = process.env.BUNDLING || production ? 'dynamic' : 'bundle'

const livereloadPort = 35729

/**
 * Reviewing later, at the moment Prerendering Breaks SSR
 */
//const shouldPrerender = (typeof process.env.PRERENDER !== 'undefined') ? process.env.PRERENDER : !!production
//console.log(`Prerender: ${shouldPrerender}`)

del.sync(distDir)
del.sync(buildDir)

function createConfig({ outputStatic, outputSSR, inlineDynamicImports, plugins = [] }) {
  const transform = inlineDynamicImports ? bundledTransform : dynamicTransform

  return {
    inlineDynamicImports,
    input: `src/main.js`,
    output: [
      {
        name: 'app',
        sourcemap: true,
        ...outputStatic
      },
      {
        name: 'app',
        sourcemap: true,
        ...outputSSR
      }
    ],
    plugins: [

      copy({
        targets: [
          { src: `${staticDir}/__index.html`, dest: distDir, rename: '__app.html', transform },
        ], copyOnce: true
      }),
      
      svelte({
        // enable run-time checks when not in production
        dev: !production,
        hydratable: true,
        // we'll extract any component CSS out into
        // a separate file — better for performance
        css: css => {
          css.write(`${buildDir}/bundle.css`);
        }
      }),

      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration —
      // consult the documentation for details:
      // https://github.com/rollup/rollup-plugin-commonjs
      resolve({
        browser: true,
        dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
      }),
      commonjs(),


      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),

      ...plugins
    ],
    watch: {
      clearScreen: false
    }
  }
}


const bundledConfig = {
  inlineDynamicImports: true,
  outputStatic: {
    format: 'iife',
    file: `${buildDir}/bundle.js`
  },
  outputSSR: {
    format: 'iife',
    file: `${distDir}/bundle.js`
  },
  plugins: [
    !production && serve(),
    !production && livereload({ 
      watch: 'static', 
      clientUrl: `//localhost:${livereloadPort}/livereload.js?snipver=1`
    })
  ]
}

const dynamicConfig = {
  inlineDynamicImports: false,
  outputStatic: {
    format: 'esm',
    dir: buildDir
  },
  outputSSR: {
    format: 'esm',
    dir: `${distDir}/build`
  },
  plugins: [
    !production && livereload({ 
      watch: 'static', 
      clientUrl: `//localhost:${livereloadPort}/livereload.js?snipver=1`
    })
  ]
}


const configs = [createConfig(bundledConfig)]
if (bundling === 'dynamic')
  configs.push(createConfig(dynamicConfig))
/**
 * Reviewing later, at the moment Prerendering Breaks SSR
 */
//if (shouldPrerender) [...configs].pop().plugins.push(prerender())
export default configs


function serve() {
  let started = false;
  return {
    writeBundle() {
      if (!started) {
        started = true;
        require('child_process').spawn('npm', ['run', 'serve'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        });
      }
    }
  };
}

function prerender() {
  console.log('Prerendering')
  return {
    writeBundle() {
      if (shouldPrerender) {
        require('child_process').spawn('npm', ['run', 'export'], {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true
        });
      }
    }
  }
}

function bundledTransform(contents) {
  return contents.toString().replace('__SCRIPT__', `	
		<script defer src="/build/bundle.js" ></script>
	`)
}

function dynamicTransform(contents) {
  return contents.toString().replace('__SCRIPT__', `	
		<script type="module" defer src="https://unpkg.com/dimport@1.0.0/dist/index.mjs?module" data-main="/build/main.js"></script>
		<script nomodule defer src="https://unpkg.com/dimport/nomodule" data-main="/build/main.js"></script>
	`)
}