import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import  LanguageSwitcher  from '@/components/LanguageSwitcher'

export default function AboutPage() {
  const { t } = useTranslation(['common', 'about'])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-semibold text-gray-900">
                Kanban App
              </Link>
              <nav className="flex space-x-4">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  {t('navigation.home')}
                </Link>
                <Link 
                  href="/about" 
                  className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md font-medium"
                >
                  {t('navigation.about')}
                </Link>
                <Link 
                  href="/board" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Board
                </Link>
              </nav>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('about:title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('about:subtitle')}
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Introduction */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {t('about:content.introduction')}
            </p>
          </section>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-blue-50 rounded-lg p-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Our Mission
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t('about:content.mission')}
              </p>
            </section>

            <section className="bg-green-50 rounded-lg p-8">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Our Vision
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t('about:content.vision')}
              </p>
            </section>
          </div>

          {/* Team Section */}
          <section className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('about:team.title')}
            </h2>
            <p className="text-gray-700 text-lg mb-8">
              {t('about:team.description')}
            </p>
            
            {/* Team Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((member) => (
                <div key={member} className="text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-900">Team Member {member}</h3>
                  <p className="text-gray-500 text-sm">Developer</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gray-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('about:contact.title')}
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              {t('about:contact.description')}
            </p>
            <div className="flex justify-center space-x-4">
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                {t('navigation.contact')}
              </button>
              <Link 
                href="/board"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Try Our Board
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'about'])),
    },
  }
}