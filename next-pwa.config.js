module.exports = {
    runtimeCaching: [
        {
            // Cache images from media.av.com (e.g., .webp, .png, .jpg, etc.)
            urlPattern: /^https:\/\/media\.aureliavalencourt\.com\/.*\.(?:webp|png|jpg|jpeg|gif|svg)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'image-cache',
                expiration: {
                    maxEntries: 100, // Cache up to 100 images
                    maxAgeSeconds: 60 * 60 * 24 * 30, // Cache for 30 days
                },
                cacheableResponse: {
                    statuses: [0, 200], // Cache only successful responses
                },
            },
        },
    ],
};
