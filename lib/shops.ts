export type ShopCategory = 'Spiritual' | 'Design' | 'Digital Tools' | 'AI' | 'Creative Services' | 'Other'

export type Shop = {
  id: string
  name: string
  shortDescription: string
  longDescription: string
  categories: ShopCategory[]
  imageUrl: string
  externalUrl: string
}

export const SHOPS: Shop[] = [
  {
    id: 'esamind-spiritual',
    name: 'ESAMIND Spiritual',
    shortDescription: 'A calm corner for intuitive and reflective digital experiences.',
    longDescription: 'This shop offers thoughtfully crafted digital experiences designed for moments of reflection and inner exploration. Each offering is created with intention, providing space for personal growth and mindful engagement.',
    categories: ['Spiritual'],
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    externalUrl: 'https://etsy.com',
  },
  {
    id: 'esamind-digital',
    name: 'ESAMIND Digital Studio',
    shortDescription: 'Clean digital tools, templates and assets for thoughtful creators.',
    longDescription: 'A curated collection of digital resources designed for creators who value both form and function. From templates to design assets, everything is crafted with attention to detail and usability.',
    categories: ['Digital Tools', 'Design'],
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    externalUrl: 'https://etsy.com',
  },
  {
    id: 'esamind-creative',
    name: 'ESAMIND Creative',
    shortDescription: 'Professional creative services and custom digital solutions.',
    longDescription: 'Offering bespoke creative services for individuals and businesses seeking thoughtful, well-executed digital solutions. Each project is approached with care and attention to both aesthetic and functional requirements.',
    categories: ['Creative Services', 'Design'],
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
    externalUrl: 'https://etsy.com',
  },
  {
    id: 'esamind-ai',
    name: 'ESAMIND AI Tools',
    shortDescription: 'AI-powered tools and resources for modern creators.',
    longDescription: 'Exploring the intersection of artificial intelligence and creative work. This shop offers AI-enhanced tools and resources designed to augment human creativity rather than replace it.',
    categories: ['AI', 'Digital Tools'],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    externalUrl: 'https://etsy.com',
  },
]

