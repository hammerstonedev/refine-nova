const mix = require('laravel-mix');
const path = require('path');

class NovaExtension {
  name() {
    return 'nova-extension';
  }

  register(name) {
    this.name = name;
  }

  webpackConfig(webpackConfig) {
    webpackConfig.externals = {
      vue: 'Vue',
    };

    webpackConfig.resolve.alias = {
      ...(webpackConfig.resolve.alias || {}),
      '@core': path.join(__dirname, '../core'),
      '@nova': path.join(__dirname, '../../vendor/laravel/nova/resources/js/mixins'),
    };

    webpackConfig.output = {
      uniqueName: this.name,
    };
  }
}

mix.extend('nova', new NovaExtension());