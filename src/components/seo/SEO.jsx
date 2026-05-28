import React from 'react'
import { Helmet } from 'react-helmet-async'

/**
 * SEO Component - Provides comprehensive meta tags for search engines.
 * All SEO data is stored and managed in the frontend database,
 * synced with backend product changes.
 *
 * Usage:
 * <SEO
 *   title="Product Name"
 *   description="Product description"
 *   image="https://.../image.jpg"
 *   type="product"
 *   price={100000}
 *   currency="IRR"
 *   availability="in_stock"
 *   category="GPS Tracker"
 * />
 */
export default function SEO({
  title,
  description = '',
  image = '',
  url = '',
  type = 'website',
  siteName = 'ATI Farzam Iranian',
  locale = 'fa_IR',
  // Product-specific
  price,
  currency = 'IRR',
  availability = 'in_stock', // in_stock | out_of_stock | preorder
  category = '',
  brand = 'ATI Farzam Iranian',
  sku = '',
  // Article-specific
  publishedTime,
  modifiedTime,
  author,
  // Robots
  noindex = false,
  nofollow = false,
  canonical,
}) {
  // Build full title
  const fullTitle = title ? `${title} | ${siteName}` : siteName

  // Robots meta
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-snippet:-1',
    'max-image-preview:large',
    'max-video-preview:-1',
  ].join(', ')

  // Schema.org structured data
  const schemas = []

  // Default WebSite schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: url || window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  })

  // Product schema
  if (type === 'product' && price) {
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      description: description,
      image: image ? [image] : [],
      brand: {
        '@type': 'Brand',
        name: brand,
      },
      offers: {
        '@type': 'Offer',
        url: url || window.location.href,
        priceCurrency: currency,
        price: price.toString(),
        availability:
          availability === 'in_stock'
            ? 'https://schema.org/InStock'
            : availability === 'out_of_stock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/PreOrder',
        itemOffered: {
          '@type': 'Product',
          name: title,
        },
        seller: {
          '@type': 'Organization',
          name: siteName,
        },
      },
    }
    if (sku) productSchema.sku = sku.toString()
    if (category) productSchema.category = category
    schemas.push(productSchema)
  }

  // Article/Blog schema
  if (type === 'article') {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: description,
      image: image ? [image] : [],
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      author: author
        ? {
            '@type': 'Person',
            name: author,
          }
        : {
            '@type': 'Organization',
            name: siteName,
          },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url || window.location.href,
      },
    })
  }

  // Organization schema (always included)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    sameAs: [
      // Add social media URLs here when available
    ],
  })

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={title || siteName} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type === 'product' ? 'product' : type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || siteName} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Product-specific OG tags */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content={currency} />
          <meta property="product:availability" content={availability} />
          <meta property="product:brand" content={brand} />
          {category && <meta property="product:category" content={category} />}
        </>
      )}

      {/* Structured Data */}
      {schemas.map((schema, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}

/**
 * Pre-configured SEO for product detail pages.
 */
export function ProductSEO({ product, url }) {
  if (!product) return null

  const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price
  const availability =
    product.stock_quantity === 0
      ? 'out_of_stock'
      : product.stock_quantity > 0
        ? 'in_stock'
        : 'in_stock'

  return (
    <SEO
      title={product.name}
      description={product.short_description || product.description?.slice(0, 160) || `${product.name} - خرید از ${product.brand || 'ATI Farzam Iranian'}`}
      image={product.primaryImage || ''}
      url={url}
      type="product"
      price={price}
      currency="IRR"
      availability={availability}
      category={product.category_name || product.category || ''}
      brand={product.brand || 'ATI Farzam Iranian'}
      sku={product.id}
    />
  )
}

/**
 * Pre-configured SEO for static pages.
 */
export function PageSEO({ title, description, image, url }) {
  return (
    <SEO
      title={title}
      description={description}
      image={image}
      url={url}
      type="website"
    />
  )
}
