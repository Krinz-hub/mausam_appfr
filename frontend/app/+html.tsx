import React from 'react';

/**
 * Root HTML template for Expo web rendering.
 * Neo-Brutalist retro sketchbook background and Comfortaa/sans typography.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap"
          rel="stylesheet"
        />
        <style
          id="neo-brutalist-web-font"
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap');

              html, body, #root, [class*="css-text-"], [class*="r-"], [class*="css-"], div, span, p, a, button, input, textarea, select, * {
                font-family: 'Comfortaa', cursive, sans-serif !important;
                -webkit-font-smoothing: antialiased;
                box-sizing: border-box;
              }
              html, body, #root {
                background-color: #FFFDF7;
                color: #171717;
                margin: 0;
                padding: 0;
                height: 100%;
                width: 100%;
                overflow-x: hidden;
              }
              /* Neo-brutalist hard scrollbars */
              ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              ::-webkit-scrollbar-track {
                background: #FFFDF7;
                border-left: 2px solid #171717;
              }
              ::-webkit-scrollbar-thumb {
                background: #FFB21A;
                border: 2px solid #171717;
                border-radius: 4px;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
