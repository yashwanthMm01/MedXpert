import { drugList } from './drugList';

export const recognizeText = async (imageData: string): Promise<string[]> => {
  // Simulate OCR analysis with fuzzy matching against drug list
  // In a real app, this would use a proper OCR service
  const delay = Math.random() * 1000 + 500; // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Randomly select 1-3 drugs from the list to simulate recognition
  const numDrugs = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...drugList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numDrugs);
};