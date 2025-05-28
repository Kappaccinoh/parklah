import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Get the repository name for GitHub Pages
  const repoName = 'parklah';
  const basePath = `/${repoName}`;

  return (
    <Html lang="en">
      <Head>
        {/* Add base tag for GitHub Pages */}
        <base href={basePath + '/'} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
