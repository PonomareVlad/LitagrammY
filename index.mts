// noinspection JSUnusedGlobalSymbols

import type {Context, MiddlewareObj, NextFunction} from "grammy";

export type TranslateFunction = (key: string, variables?: Record<string, any>) => string;

export interface Locale {

    [key: string]: any

}

export interface Locales {

    [key: string]: Locale

}

export type I18nFlavor<C extends Context> = C & {

    translate: TranslateFunction,

    t: TranslateFunction,

}

export interface i18nOptions {

    defaultLocale?: string,

    locales?: Locales,

}

export class I18n implements MiddlewareObj<I18nFlavor<Context>> {

    options = {

        defaultLocale: "en" as string,

        locales: {} as Locales

    }

    constructor(options = {} as i18nOptions) {

        Object.assign(this.options, options);

    }

    translate(locale: string, key: string, variables = {} as Record<string, any>): string {

        const {
            locales,
            defaultLocale
        } = this.options;

        const target =
            locales?.[locale]?.[key] ??
            locales?.[defaultLocale]?.[key] ?? key

        return String(
            typeof target === "function" ?
                target(variables) :
                target
        ).trim();

    }

    middleware() {

        return async <C extends Context>(ctx: I18nFlavor<C>, next: NextFunction): Promise<void> => {

            const {
                from: {
                    language_code = this.options.defaultLocale
                } = {}
            } = ctx;

            const translate = this.translate.bind(this, language_code);

            ctx.translate = ctx.t = translate;

            return next();

        }

    }

}
