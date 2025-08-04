import 'react-i18next'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: {
        welcome: string
        navigation: {
          home: string
          about: string
          contact: string
        }
        buttons: {
          submit: string
          cancel: string
          save: string
        }
        messages: {
          loading: string
          error: string
          success: string
        }
        user: {
          profile: string
          settings: string
          logout: string
        }
      }
      about: {
        title: string
        subtitle: string
        content: {
          introduction: string
          mission: string
          vision: string
        }
        team: {
          title: string
          description: string
        }
        contact: {
          title: string
          description: string
        }
      }
    }
  }
}