import Fraction from 'fraction.js';
import { jwtDecode } from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';

export const getUserIdFromToken = () => {
  if (typeof window === 'undefined') {
    return null; // Make sure we're in the browser, not SSR
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return null; // No token found
  }

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.userId; // Adjust this key based on your JWT payload structure
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

// Helper to initialize sessionId
export const initializeSessionId = () => {
  if (typeof window === 'undefined') {
    return null; // Make sure we're in the browser, not SSR
  }
  // Check if sessionId already exists in localStorage
  let sessionId = localStorage.getItem('sessionId');

  if (!sessionId) {
    // Generate a new UUID for sessionId if it doesn't exist
    sessionId = uuidv4();
    localStorage.setItem('sessionId', sessionId);
  }

  return sessionId;
};

export const isInAppBrowser = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Detect Gmail in-app browser
  const isGmail = /Gmail/.test(userAgent);

  // Detect Facebook & Instagram in-app browsers
  const isFacebook = /FBAN|FBAV/.test(userAgent);
  const isInstagram = /Instagram/.test(userAgent);

  // Detect Twitter in-app browser
  const isTwitter = /Twitter/.test(userAgent);

  // Detect TikTok in-app browser
  const isTikTok = /Tiktok/.test(userAgent);

  return isGmail || isFacebook || isInstagram || isTwitter || isTikTok;
};

export function convertImageUrl(url) {
  const dotIndex = url.lastIndexOf('.');
  const convertedUrl = url.slice(0, dotIndex) + '-banner' + url.slice(dotIndex);
  return convertedUrl;
}

const unitConversionTable = {
  gram: 1, // base unit (solid)
  kilogram: 1000,
  milliliter: 1, // base unit (liquid)
  liter: 1000,
  ounce: 29.5735, // approximation for fluid ounces
  shot: 44.36, // average size for a shot, in milliliters
  tablespoon: 15, // approximation for liquids
  teaspoon: 5,  // approximation
  cup: 240,  // approximation for volume
  pint: 473, // US pint
  dash: 0.92, // approximate volume of a dash in milliliters
  pinch: 0.36, // for solids (approximation)
  "to taste": -1, // special case
  "splash": 3.7, // approximation for a splash of liquid
  "jigger": 44.36, // standard jigger size in milliliters
  "drop": 0.05, // approximation for a drop of liquid
  // Add more as needed
};

export const convertToBaseUnit = (ingredient) => {
  if (ingredient.unitByUnitId.unitName) {
    const unit = ingredient.unitByUnitId.unitName.toLowerCase();

    // Handle "to taste" as a special case
    if (ingredient.quantity === -1 || unit === "to taste") {
      return -Infinity; // Push "to taste" to the bottom when sorting
    }

    const conversionFactor = unitConversionTable[unit] || 1;
    return ingredient.quantity * conversionFactor;
  }  else {
    return -Infinity;
  }
};

export const decimalToFraction = (decimal, mixed = true) => {
  let fraction = new Fraction(decimal);

  let numerator = Number(fraction.n);
  let denominator = Number(fraction.d);

  if (denominator === 1) {
      return `${numerator}`; // Return whole number
  }

  if (mixed && numerator > denominator) {
      let whole = Math.floor(numerator / denominator);
      let remainder = numerator % denominator;
      return remainder === 0 ? `${whole}` : `${whole} ${remainder}/${denominator}`;
  }

  return `${numerator}/${denominator}`; // Return proper fraction
}

export const formatTime = (time) => {
  const units = [];
  if (time.years) units.push(`${time.years} year${time.years > 1 ? 's' : ''}`);
  if (time.months) units.push(`${time.months} month${time.months > 1 ? 's' : ''}`);
  if (time.days) units.push(`${time.days} day${time.days > 1 ? 's' : ''}`);
  if (time.hours) units.push(`${time.hours} hour${time.hours > 1 ? 's' : ''}`);
  if (time.minutes) units.push(`${time.minutes} minute${time.minutes > 1 ? 's' : ''}`);
  if (time.seconds) units.push(`${time.seconds} second${time.seconds > 1 ? 's' : ''}`);

  return units.length > 0 ? units.join(', ') : 'N/A';
};

export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const generateCocktailUrl = (uuid, title) => {
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  return `/cocktails/${uuid}/${slug}`;
};

export const generateProfileUrl = (uuid, name) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return `/cocktail-profiles/${uuid}/${slug}`;
};

export const generateEquipmentUrl = (uuid, name) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return `/equipment/${uuid}/${slug}`;
};

export const getOptimizedImageUrl = (imageUrl, isWebPSupported) => {
  if (!imageUrl) return '';
  if (isWebPSupported && imageUrl.endsWith('.png')) {
    return imageUrl.replace('.png', '.webp');
  }
  return imageUrl;
};
