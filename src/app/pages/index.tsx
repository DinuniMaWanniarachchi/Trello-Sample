import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import  LanguageSelector  from '@/components/LanguageSelector';

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              {t('welcome')}
            </h1>
            <LanguageSelector />
          </div>
          
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              {t('hello')} 👋
            </p>
            <p className="text-lg text-gray-600">
              {t('goodbye')} 👋
            </p>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              {t('current_language')}: {t('language')}
            </h3>
            <p className="text-sm text-gray-600">
              {t('select_language_instruction')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
      ])),
    },
  };
};