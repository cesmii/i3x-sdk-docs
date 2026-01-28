// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'i3X Docs',
  tagline: 'A common API for contextualized manufacturing information platforms',
  //favicon: 'img/favicon.ico',
  favicon: 'img/i3X_circle.png',
  
  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'http://i3x.dev/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'cesmii', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/i3X_circle.png',
      colorMode: {
        disableSwitch: true,
        // respectPrefersColorScheme: true,
      },
      navbar: {
        //title: 'i3X',
        logo: {
          alt: 'i3X Logo',
          src: 'img/i3X_circle.png',
        },
        items: [
          {
            href: 'https://connect.cesmii.org/i3X',
            label: 'About i3X',
            position: 'left',
          },
          {
            type: 'docSidebar',
            sidebarId: 'DocsSidebar',
            position: 'left',
            label: 'Introduction',
          },
          {
            type: 'docSidebar',
            sidebarId: 'Server-Developers',
            position: 'left',
            label: 'Server Developers',
          },
          {
            type: 'docSidebar',
            sidebarId: 'Server-Developers',
            position: 'left',
            label: 'Server Developers',
          },
          {
            type: 'docSidebar',
            sidebarId: 'Client-Developers',
            position: 'left',
            label: 'Client Developers',
          },          
          {
            href: 'https://acetechnologies.net/i3X',
            label: 'i3X Explorer',
            position: 'left',
          },
          {
            href: 'https://github.com/cesmii/i3X',
            label: 'GitHub',
            position: 'left',
          },
          {
            href: 'https://connect.cesmii.org/i3x#sm-imperatives',
            label: 'SM Imperatives',
            position: 'left',
          },
          {
            href: 'https://www.cesmii.org/',
            label: 'CESMII',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Places',
            items: [
              {
                label: 'i3X Introduction',
                to: '/docs/i3X-introduction',
              },              
              {
                label: 'Server Developers',
                to: '/docs/Server-Developers/overview',
              },
              {
                label: 'Client Developers',
                to: '/docs/Client-Developers/overview',
              },              
              {
                href: 'https://connect.cesmii.org/i3X',
                label: 'i3X Overview',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/channel/UCzfo1qx-6ExYGdW-S8A3HAA',
              },
              {
                label: 'iTunes',
                href: 'https://podcasts.apple.com/us/podcast/smart-manufacturing-mindset/id1694727743',
              },
              {
                label: 'Spotify',
                href: 'https://open.spotify.com/show/2EYduePF6JsI37pRDtDaGz?si=6a3bcb806bb94233&nd=1&dlsi=39d0101bfc2140d8',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/the-smart-manufacturing-institute/',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/cesmii/i3X',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CESMII`,
      },
/*      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
*/
      }),
};

export default config;
