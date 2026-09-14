import React from 'react';

/**
 * Root HTML template for Expo web rendering.
 * Injects Google Fonts Comfortaa stylesheet into the document head.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <style
          id="comfortaa-web-font"
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap');

              html, body, #root, [class*="css-text-"], [class*="r-"], [class*="css-"], div, span, p, a, button, input, textarea, select, * {
                font-family: 'Comfortaa', cursive, sans-serif !important;
              }
              html, body, #root {
                background-color: #071521;
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
