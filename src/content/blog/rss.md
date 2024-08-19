---
id: 04
title: "Creating an RSS Feed with Astro.js"
excerpt: "Creating an RSS feed with Astro is easy. You just need to create a new file in your Astro project that contains the feed data. You can then use Astro's built-in feed function to generate the feed."
publishDate: "August 19 2024"
---

## What is an RSS feed?

RSS stands for Really Simple Syndication. It is a way to easily distribute a list of headlines, update notices, and sometimes content to a wide number of people. It is used by computer programs that organize those headlines and notices for easy reading.

Essentially, an RSS feed is a way to keep up with your favorite blogs, news sites, and other websites. It saves you time by not needing to visit each site individually. It ensures that you are getting the latest content from your favorite sites.

## I see the RSS symbol, now what?

If you see the RSS symbol on a website, it means that the site has an RSS feed. You can subscribe to the feed by clicking on the symbol and following the instructions. You will need a computer program that can read RSS feeds to subscribe.

Once you have subscribed to a feed, your computer program will check the feed for updates and download the new content. You can then read the content in your program or click on the links to visit the original site.

Here are few popular RSS readers (besides the built-in ones in most browsers and email clients):

- Feedly
- Inoreader
- NewsBlur
- The Old Reader
- NetNewsWire
- Reeder
- Feedbin

## Here's how I added RSS to my Astro.js site

Creating an RSS feed with Astro is easy. You just need to create a new file in your Astro project that contains the feed data. You can then use Astro's built-in feed function to generate the feed. You can customize the feed to include the content that you want and to match the style of your site.

I created file called `rss.xml.js` in my `src/pages` directory and added this code:

```javascript
src/pages/rss.xml.js

import rss from "@astrojs/rss"
import { getCollection } from "astro:content"

export async function GET(context) {
	const blog = await getCollection("blog")
	return rss({
		// `<title>` field in output xml
		title: "chuckreynolds.dev",
		// `<description>` field in output xml
		description: "the personal blog of Chuck Reynolds, a web developer from Chicago, IL.",
		// Pull in your project "site" from the endpoint context
		// https://docs.astro.build/en/reference/api-reference/#contextsite
		site: context.site,
    // Path to your custom XSL stylesheet
		stylesheet: "/rss/styles.xsl",
		// Array of `<item>`s in output xml
		// See "Generating items" section for examples using content collections and glob imports
		items: blog
			.map(post => ({
				title: post.data.title,
				pubDate: post.data.publishDate,
				description: post.data.excerpt,
				link: `/blog/${post.slug}/`,
				...post.data,
			}))
		// (optional) inject custom xml
		customData: `<language>en-us</language>`,
	})
}
}
```

This code creates an RSS feed for my blog. It pulls in the blog posts from my `blog` collection and generates an RSS feed with the title, description, and link for each post. It also includes a custom XSL stylesheet to style the feed.

I then added a link to the feed in my site's header:

```html
<link rel="alternate" type="application/rss+xml" title="My Blog" href={new URL("rss.xml", Astro.site)} />
```

This link tells browsers and RSS readers that there is an RSS feed available for my site. Users can click on the link to subscribe to the feed and get updates on my latest blog posts.

That's it! I now have an RSS feed for my Astro.js site. It was easy to create and customize, and it helps me distribute my content to a wider audience. If you are using Astro.js for your site, I highly recommend adding an RSS feed to keep your audience engaged and updated on your latest content.

## Conclusion

Adding an RSS feed to your Astro.js site is a great way to distribute your content to a wider audience. It is easy to create and customize, and it helps keep your audience engaged and updated on your latest content. If you are using Astro.js for your site, I highly recommend adding an RSS feed. It is a simple and effective way to keep your audience informed and engaged with your content.

## Bonus: Adding some style

You may notice that the RSS feed is just plain XML. You can add some style to it by creating a custom XSL stylesheet. Here's an example of a simple XSL stylesheet that adds some style to the feed:

You can use the Pretty-Feed-V3 stylesheet to style your RSS feed. Just save it as `styles.xsl` in a `rss` directory in your `src` folder.

[Github: Pretty-Feed-V3.xsl stylesheet](https://github.com/genmon/aboutfeeds/blob/main/tools/pretty-feed-v3.xsl)
