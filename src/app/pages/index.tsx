import { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import  LanguageSwitcher  from '@/components/LanguageSwitcher'

export default function HomePage() {
  const { t } = useTranslation('common')

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">
                {t('welcome')}
              </h1>
              <nav className="flex space-x-4">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  {t('navigation.home')}
                </Link>
                <Link 
                  href="/about" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
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
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('welcome')}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Manage your projects with our Kanban board
          </p>
          
          <div className="flex justify-center space-x-4">
            <Link 
              href="/board"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {t('buttons.submit')} Project
            </Link>
            <Link 
              href="/about"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {t('navigation.about')}
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-lg p-4 mb-4 inline-block">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Organize Tasks</h3>
            <p className="text-gray-600">Keep your projects organized with lists and cards</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-lg p-4 mb-4 inline-block">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-600">Work together seamlessly with your team</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-lg p-4 mb-4 inline-block">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast & Intuitive</h3>
            <p className="text-gray-600">Drag and drop interface for quick updates</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  }
}