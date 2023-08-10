import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function get(context) {
  const posts = (await getCollection("blog")).filter((p) => !p.data.draft);
  const options = {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      link: `/${post.slug}/`,
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
    })),
  };
  return rss(options);
}
