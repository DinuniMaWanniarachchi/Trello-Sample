import { GetStaticProps, GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getI18nProps = (namespaces: string[] = ['common']) => {
  const getStaticProps: GetStaticProps = async (ctx: GetStaticPropsContext) => {
    const { locale } = ctx;
    
    return {
      props: {
        ...(await serverSideTranslations(locale ?? 'en', namespaces)),
      },
    };
  };
  
  return getStaticProps;
};