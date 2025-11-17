import { drugList } from './drugList';
import Fuse from 'fuse.js';

// Enhanced fuzzy search with weighted scoring
const fuseOptions = {
  includeScore: true,
  threshold: 0.4,
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'variations', weight: 0.3 }
  ]
};

// Preprocess drug list with common variations
const enhancedDrugList = drugList.map(drug => ({
  name: drug,
  variations: [
    drug.toLowerCase(),
    drug.replace(/[aeiou]/gi, ''), // Remove vowels
    drug.replace(/[^a-zA-Z]/g, ''), // Remove non-alphabetic chars
    ...generateCommonMisspellings(drug)
  ]
}));

const fuse = new Fuse(enhancedDrugList, fuseOptions);

// Generate common misspellings and variations
function generateCommonMisspellings(word: string): string[] {
  const variations: string[] = [];
  const lowerWord = word.toLowerCase();

  // Common character substitutions
  const substitutions: { [key: string]: string[] } = {
    'f': ['ph'],
    'i': ['y'],
    'c': ['k', 's'],
    'z': ['s'],
    'v': ['f'],
    'x': ['ks'],
    'qu': ['k', 'kw']
  };

  // Generate variations with common substitutions
  Object.entries(substitutions).forEach(([original, replacements]) => {
    if (lowerWord.includes(original)) {
      replacements.forEach(replacement => {
        variations.push(lowerWord.replace(new RegExp(original, 'g'), replacement));
      });
    }
  });

  // Add variations with doubled letters removed
  for (let i = 1; i < word.length; i++) {
    if (word[i] === word[i - 1]) {
      variations.push(word.slice(0, i) + word.slice(i + 1));
    }
  }

  return variations;
}

// Enhanced recognition with confidence scoring
export function recognizeHandwriting(text: string): { 
  match: string | null;
  confidence: number;
  alternatives: string[];
} {
  if (!text) {
    return { match: null, confidence: 0, alternatives: [] };
  }

  const results = fuse.search(text);
  const alternatives: string[] = [];
  
  // Get top 3 matches as alternatives
  results.slice(0, 3).forEach(result => {
    alternatives.push(result.item.name);
  });

  if (results.length > 0 && results[0].score !== undefined) {
    const confidence = 1 - results[0].score;
    if (confidence > 0.6) { // Higher confidence threshold
      return {
        match: results[0].item.name,
        confidence,
        alternatives: alternatives.slice(1) // Exclude the main match
      };
    }
  }

  return {
    match: null,
    confidence: 0,
    alternatives
  };
}