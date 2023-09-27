import {ref, computed} from "vue";
import axios from "axios";
import _ from 'lodash';

export default {
    install( app, options ) {
        let $lang = ref( 'en' );
        let $langOptions = options.options;
        let i18nSettings = JSON.parse( localStorage.getItem( 'i18n' ) ) || {};

        app.config.globalProperties.$lang = $lang;
        app.config.globalProperties.$langData = ref( {} );
        app.config.globalProperties.$langOptions = $langOptions;

        app.config.globalProperties.$activeLang = computed(() => {
            for( let i in $langOptions ) {
                let opt = $langOptions[i];
                if( $lang.value === opt.value ) {
                    return opt;
                }
            }
        });

        app.config.globalProperties.$tr = ( key ) => {
            return app.config.globalProperties.$langData.value[key];
        }

        app.config.globalProperties.$useLang = ( lang, save ) => {
            app.config.globalProperties.$lang.value = lang;

            if( lang === 'en' ) {
                app.config.globalProperties.$langData.value = {};
            } else {
                axios.get( options.baseUrl + lang + '.json' )
                    .then(( res ) => {
                        app.config.globalProperties.$langData.value = res.data;
                    });
            }

            if( save ) {
                i18nSettings.lang = lang;
                localStorage.setItem( 'i18n', JSON.stringify( i18nSettings ) );
            }
        }

        app.config.globalProperties.$langSupported = ( lang ) => {
            if( !_.isArray( options.options ) ) {
                return false;
            }

            for( let i in options.options )  {
                let langOpt = options.options[i];

                if( langOpt.value === lang ) {
                    return true;
                }
            }

            return false;
        }

        if( i18nSettings && i18nSettings.lang )  {
            app.config.globalProperties.$useLang( i18nSettings.lang );
        } else {
            let navigatorLang = navigator.language.split( '-' )[0];

            if( app.config.globalProperties.$langSupported( navigatorLang ) ) {
                app.config.globalProperties.$useLang( navigatorLang );
            }
        }
    }
}