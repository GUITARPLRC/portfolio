export type Image = {
    src: string;
    alt?: string;
};

export type Link = {
    href: string;
    text: string;
};

export type SocialLink = Link & {
    icon: 'dev' | 'github' | 'linkedin';
};

export type Hero = {
    title?: string;
    text?: string;
    avatar?: Image;
    backgroundImage?: Image;
};

export type SiteConfig = {
    logo?: Image;
    title: string;
    description: string;
    image?: Image;
    primaryNavLinks?: Link[];
    secondaryNavLinks?: Link[];
    socialLinks?: SocialLink[];
    hero?: Hero;
    postsPerPage?: number;
};

const siteConfig: SiteConfig = {
    logo: {
        src: '/logo.svg',
        alt: 'My logo'
    },
    title: 'Chuck Reynolds',
    description: 'My blog about web development, specifically front end usually javascript related and other cool stuff.',
    primaryNavLinks: [
        {
            text: 'Home',
            href: '/'
        },
        {
            text: 'Blog',
            href: '/blog'
        },
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Contact',
            href: '/contact'
        }
    ],
    secondaryNavLinks: [
        {
            text: 'About',
            href: '/about'
        },
        {
            text: 'Contact',
            href: '/contact'
        }
    ],
    socialLinks: [
        {
            text: 'Go to GitHub repo',
            href: 'https://github.com/guitarplrc',
            icon: 'github'
        },
        {
            text: 'Go to LinkedIn profile',
            href: 'https://www.linkedin.com/in/chuck-reynolds/',
            icon: 'linkedin'
        }
    ],
    hero: {
        title: 'Hi there!!',
        text: "My name is Chuck Reynolds. I'm a freelance front-end developer, author and musician based in Chicago, Il. It's nice to meet you.",
        avatar: {
            src: '/avatar.jpg',
            alt: 'Chuck Reynolds'
        },
        backgroundImage: {
            src: '/hero.webp'
        }
    },
    postsPerPage: 3
};

export default siteConfig;
