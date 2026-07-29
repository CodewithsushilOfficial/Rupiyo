export default function manifest() {
  return {
    name: 'Rupiyo — Expense Tracker',
    short_name: 'Rupiyo',
    description: 'Advanced Expense Tracker & Personal Finance Web App',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#F7F8FC',
    theme_color: '#6759E8',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
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
