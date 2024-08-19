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
			.slice(0, 10)
			.map(post => ({
				title: post.data.title,
				pubDate: post.data.publishDate,
				description: post.data.excerpt,
				// content: sanitizeHtml(parser.render(post.body), {
				// 	allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				// }),
				link: `/blog/${post.slug}/`,
				...post.data,
			}))
			.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)),
		// (optional) inject custom xml
		customData: `<language>en-us</language>`,
	})
}
