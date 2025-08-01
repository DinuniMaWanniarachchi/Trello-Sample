/* eslint-disable @next/next/no-html-link-for-pages */
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

export default function Home() {
  const { t } = useTranslation('common');
  const router = useRouter();

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale });
  };

  return (
    <div>
      <h1>{t('welcome')}</h1>
      
      <nav>
        <a href="/">{t('navigation.home')}</a>
        <a href="/about">{t('navigation.about')}</a>
        <a href="/contact">{t('navigation.contact')}</a>
      </nav>

      <div>
        <h3>Language Switcher:</h3>
        <button onClick={() => changeLanguage('en')}>English</button>
        <button onClick={() => changeLanguage('es')}>Español</button>
        <button onClick={() => changeLanguage('fr')}>Français</button>
        <button onClick={() => changeLanguage('de')}>Deutsch</button>
      </div>

      <p>Current locale: {router.locale}</p>
      
      <button>{t('buttons.submit')}</button>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};