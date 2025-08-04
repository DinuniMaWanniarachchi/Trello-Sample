/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'],
  },
  /** To avoid issues when deploying to some paas (vercel...) */
  localePath:
    typeof window === 'undefined'
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ? require('path').resolve('./public/locales')
      : '/locales',
  
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}