export default function manifest() {
  return {
    name: 'Rupiyo — Personal Finance',
    short_name: 'Rupiyo',
    description: 'Smart Expense Tracker & Personal Finance App',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFFFFF',
    theme_color: '#6759E8',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/maskable-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    share_target: {
      action: '/transactions/import',
      method: 'POST',
      enctype: 'multipart/form-data',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
        files: [
          {
            name: 'file',
            accept: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          },
        ],
      },
    },
  };
}
