import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: 'CQQRS',
	tagline: 'Slow Morse Code Community',
	favicon: 'img/favicon.svg',

	// Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
	future: {
		v4: true, // Improve compatibility with the upcoming Docusaurus v4
	},

	// Set the production url of your site here
	url: 'https://CQQRS.github.io',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'CQQRS', // Usually your GitHub org/user name.
	projectName: 'CQQRS.github.io', // Usually your repo name.

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
			{
				docs: {
					sidebarPath: './sidebars.ts',
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					/*
					editUrl:
						'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
						*/
				},
				blog: {
					showReadingTime: true,
					feedOptions: {
						type: ['rss', 'atom'],
						xslt: true,
					},
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl:
						'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
					// Useful options to enforce blogging best practices
					onInlineTags: 'warn',
					onInlineAuthors: 'warn',
					onUntruncatedBlogPosts: 'warn',
				},
				theme: {
					customCss: './src/css/custom.css',
				},
			} satisfies Preset.Options,
		],
	],

	themeConfig: {
		// Replace with your project's social card
		//image: 'img/docusaurus-social-card.jpg',
		colorMode: {
			respectPrefersColorScheme: true,
		},
		navbar: {
			title: 'CQQRS',
			logo: {
				alt: 'CQQRS Logo',
				src: 'img/favicon.svg',
			},
			items: [
				/*
				{
					type: 'docSidebar',
					sidebarId: 'ragchewArchiveSidebar',
					position: 'left',
					label: 'Ragchew Archive',
				},
				*/
				{
					to: '/report-form',
					label: 'Report Form',
					position: 'left',
				},
			],
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Docs',
					items: [
						/*
						{
						  label: 'Tutorial',
						  to: '/docs/intro',
						},
						*/
					],
				},
				{
					title: 'Community',
					items: [
						/*
						{
						  label: 'Stack Overflow',
						  href: 'https://stackoverflow.com/questions/tagged/docusaurus',
						},
						{
						  label: 'Discord',
						  href: 'https://discordapp.com/invite/docusaurus',
						},
						*/
						{
							label: 'WhatsApp',
							href: 'https://www.whatsapp.com/',
						},
					],
				},
				{
					title: 'More',
					items: [
						/*
						{
						  label: 'Blog',
						  to: '/blog',
						},
						*/
						{
							label: 'CQQRS Google Site',
							href: 'https://sites.google.com/view/cqqrs/home',
						},
					],
				},
			],
			copyright: `Copyright © ${new Date().getFullYear()} CQQRS Community.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula,
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
