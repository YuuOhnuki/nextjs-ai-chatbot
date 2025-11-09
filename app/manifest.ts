import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Next.js Chatbot Template',
    short_name: 'Chatbot',
    description: 'Next.js chatbot template using the AI SDK.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#006cff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
