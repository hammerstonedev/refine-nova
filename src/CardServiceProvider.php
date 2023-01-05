<?php

namespace Hammerstone\Refine\Nova;

use Hammerstone\Refine\Conditions\Clause;
use Hammerstone\Refine\Frontend\Vue2Frontend;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Laravel\Nova\Events\ServingNova;
use Laravel\Nova\Nova;

class CardServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->app->booted(function () {
            $this->routes();
        });

        if (class_exists('\Hammerstone\Refine\Conditions\Clause')) {
            if (is_null(Clause::$resolveComponentUsing)) {
                Clause::$resolveComponentUsing = Vue2Frontend::class;
            }
        }

        Nova::serving(function (ServingNova $event) {
            Nova::script('refine-nova-card', __DIR__ . '/../dist/js/card.js');
            Nova::style('refine-nova', __DIR__ . '/../dist/css/card.css');
        });
    }

    /**
     * Register the card's routes.
     *
     * @return void
     */
    protected function routes()
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        Route::middleware(['nova'])
            ->prefix('nova-vendor/refine-nova')
            ->group(__DIR__ . '/../routes/api.php');
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
