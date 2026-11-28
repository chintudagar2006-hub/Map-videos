export const SITE = {
  name: 'FC Gym Rohtak',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fc-gym-rohtak-concept.pages.dev',
  location: 'Ek Rupaya Chowk, Rohtak, Haryana',
  mapUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Ek Rupaya Chowk, Rohtak, Haryana, India'),
  disclosure: 'Independent website design concept. Not an official FC Gym website.',
};

export const NAV = [
  { href: '#experience', label: 'Experience' },
  { href: '#vision', label: 'Vision' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#location', label: 'Location' },
];
