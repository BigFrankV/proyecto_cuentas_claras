import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='es'>
      <Head>
        {/* Meta tags esenciales */}
        <meta name='application-name' content='Cuentas Claras' />
        <meta
          name='description'
          content='Sistema de administración de comunidades'
        />
        <meta name='theme-color' content='#0d47a1' />

        {/* Material Icons */}
        <link
          href='https://fonts.googleapis.com/icon?family=Material+Icons'
          rel='stylesheet'
        />

        {/* Font Awesome */}
        <link
          href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
          rel='stylesheet'
        />

        {/* Google Fonts */}
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
          rel='stylesheet'
        />

        {/* Preconnect para optimización */}
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin=''
        />

        {/* Favicon */}
        <link rel='icon' href='/favicon.ico' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />

        {/* PWA Manifest */}
        <link rel='manifest' href='/manifest.json' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

