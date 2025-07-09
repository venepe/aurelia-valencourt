const { gql } = require('@apollo/client');
const client = require('./apolloClient');
const { SITE_URL } = require('./config');


module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  transform: async (config, path) => {
    return {
      loc: path, // The URL for the page
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async () => {
    const paths = [];

    try {
      const { data } = await client.query({
        query: gql`
        query GetSlugs {
          allCocktails {
            nodes {
              cocktailId
              title
              updatedAt
            }
          }
          allTags {
            nodes {
              tagId
              tagName
              createdAt
            }
          }
          allTags {
            nodes {
              tagId
              tagName
              createdAt
            }
          }
          allEquipment {
            nodes {
              equipmentId
        			name
              createdAt
            }
          }
        }
        `,
      });

      data.allCocktails.nodes.forEach((node) => {
        const title = node.title.replace(/\s+/g, '-').toLowerCase();
        const lastmod = new Date().toISOString();
        paths.push({
          loc: `/cocktails/${node.cocktailId}/${title}`,
          lastmod,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });

      data.allTags.nodes.forEach((node) => {
        const tagName = node.tagName.replace(/\s+/g, '-').toLowerCase();
        const lastmod = new Date(node.createdAt).toISOString();
        paths.push({
          loc: `/cocktail-profiles/${node.tagId}/${tagName}`,
          lastmod,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });

      data.allEquipment.nodes.forEach((node) => {
        const name = node.name.replace(/\s+/g, '-').toLowerCase();
        const lastmod = new Date(node.createdAt).toISOString();
        paths.push({
          loc: `/equipment/${node.equipmentId}/${name}`,
          lastmod,
          changefreq: 'weekly',
          priority: 0.8,
        });
      });
    } catch (error) {
      console.error('Error fetching data for sitemap:', error);
    }

    return paths;
  },
};
