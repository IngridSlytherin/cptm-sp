import type { MetadataRoute } from 'next';
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.DOMAIN&&process.env.DOMAIN!=='localhost'?`https://${process.env.DOMAIN}`:'http://localhost:3000';return[{url:base,lastModified:new Date(),changeFrequency:'hourly',priority:1}]}
