import type {Context, MiddlewareFn, MiddlewareObj, NextFunction} from "grammy";

export type TranslationResult = string | string[];

export type LocaleFunction = (variables?: Record<string, any>) => TranslationResult

export type TranslateFunction = (key: string, variables?: Record<string, any>) => TranslationResult;

export type Locale = Record<string, TranslationResult | LocaleFunction>;

export interface I18nFlavor {

    t: TranslateFunction;

}

export interface i18nOptions {

    defaultLocale?: string,

    locales?: Record<string, Locale>,

}

export class I18n implements MiddlewareObj<Context & I18nFlavor> {

    options = {
        locales: {},
        defaultLocale: "en"
    } as i18nOptions;

    constructor(options = {} as i18nOptions) {

        Object.assign(this.options, options);

    }

    translate(locale: string, key: string, variables = {} as Record<string, any>): TranslationResult {

        const {
            locales = {},
            defaultLocale = ""
        } = this.options;

        const targetLocale = locales[locale] || locales[defaultLocale] || {};

        const target = targetLocale[key] || key;

        return typeof target === "function" ?
            target(variables) :
            target;

    }

    middleware(): MiddlewareFn<Context & I18nFlavor> {

        return async (ctx: Context & I18nFlavor, next: NextFunction): Promise<void> => {

            const {
                from: {
                    language_code
                } = {}
            } = ctx;

            ctx.t = this.translate.bind(this, language_code || "");

            return next();

        }

    }

}
