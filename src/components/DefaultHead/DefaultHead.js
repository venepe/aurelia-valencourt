import React from 'react';
import Head from 'next/head';
import R from '../../resources';

const DefaultHead = ({
  title = R.strings.APP_TITLE,
  description = R.strings.APP_DESCRIPTION,
  imageUrl = R.strings.APP_LOGO_BANNER_URL,
  url = R.strings.APP_LANDING_URL,
  recipeSchema = null,
}) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />

    {/* Open Graph Meta Tags */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={imageUrl} />
    <meta property="og:image:width" content="600" />
    <meta property="og:image:height" content="315" />
    <meta property="og:url" content={url} />
    <meta property="og:site_name" content={R.strings.APP_NAME} />
    <meta property="og:type" content="website" />
    <meta property="fb:app_id" content="569456238888771" />

    {/* Twitter Meta Tags */}
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={imageUrl} />
    <meta name="twitter:card" content="summary_large_image" />

    {/* Optional JSON-LD structured data for Recipe */}
    {recipeSchema && (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />
    )}
  </Head>
);

export default DefaultHead;
