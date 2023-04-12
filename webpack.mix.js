let mix = require('laravel-mix')
let tailwindcss = require('tailwindcss')
let path = require('path')
let unique = require('./unique')
let fs = require('fs')
const { execSync } = require('child_process')
let BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// In our build step we pass a --cssonly flag when
// building the multiple Nova CSS files.
let shouldCompileJavascript = process.env.npm_config_cssonly !== 'true'

// Use the version of Nova that was passed in, or use the most
// recent version listed in the versions.txt file.
let novaVersion =
  process.env.npm_config_nova ||
  fs
    .readFileSync(path.join(__dirname, `build/versions.txt`), 'utf8')
    .split('\n')[0]

if (!mix.inProduction()) {
  // Hard code for local testing.
  novaVersion = 'v4.22.2'

  try {
    // Try to read it out of the nova4 project, if it exists.
    novaVersion =
      'v' +
      execSync(
        "composer show laravel/nova | grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+'",
        { cwd: '../nova4' }
      )
        .toString()
        .trim()
        .split('\n')[0]
  } catch (e) {
    console.log('Could not find nova4 version')
  }
}

console.log(`Compiling for Nova version: ${novaVersion}`)

mix
  .setPublicPath('dist')
  .alias({
    '@': path.join(__dirname, 'resources/js'),
    '@nova': path.join(__dirname, 'vendor/laravel/nova/resources/js'),
  })
  .vue({
    version: 3,
  })
  .webpackConfig({
    // Vue is provided by Nova, so we don't need to bundle it.
    externals: {
      vue: 'Vue',
    },
    output: {
      uniqueName: 'hammerstone/refine',
    },
    plugins: [mix.inProduction() ? new BundleAnalyzerPlugin() : null].filter(
      p => p
    ),
  })
  .postCss('resources/css/card.css', `dist/css/${novaVersion}.css`, [
    require('postcss-import'),
    tailwindcss('tailwind.config.js'),
    unique({
      // Remove all the styles that are already present in
      // this particular version of Nova's CSS.
      path: path.join(__dirname, `build/nova/${novaVersion}/app.css`),
    }),
  ])

// When we're compiling the CSS over and over again for all the different
// Nova versions, we don't need to compile the JS. But if not... we do!
if (shouldCompileJavascript) {
  mix.js('resources/js/card.js', 'js')
}
