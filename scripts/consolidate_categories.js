const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'cropsData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Define a strict 10-category list
const CATEGORIES = [
  "Cereals", "Pulses", "Vegetables", "Fruits", "Oilseeds", 
  "Cash Crops", "Spices", "Plantation", "Medicinal", "Horticulture"
];

// Broad mapping
const mapping = {
  // Cereals
  'Cereal': 'Cereals',
  
  // Pulses
  'Pulse': 'Pulses',
  
  // Vegetables
  'Vegetable': 'Vegetables',
  'Tuber/Vegetable': 'Vegetables',
  'Pulse/Vegetable': 'Vegetables',
  'Vegetable/Superfood': 'Vegetables',
  'Fungi': 'Vegetables',
  
  // Fruits
  'Fruit': 'Fruits',
  'Fruit/Vegetable': 'Fruits',
  'Spice/Fruit': 'Fruits',
  
  // Oilseeds
  'Oilseed': 'Oilseeds',
  'Plantation/Oilseed': 'Oilseeds',
  
  // Cash Crops
  'Cash Crop': 'Cash Crops',
  'Commercial': 'Cash Crops',
  'Commercial/Fiber': 'Cash Crops',
  'Commercial/Sericulture': 'Cash Crops',
  'Commercial/Eco-friendly': 'Cash Crops',
  'Vegetable/Commercial': 'Cash Crops',
  'Herb/Commercial': 'Cash Crops',
  
  // Spices
  'Spice': 'Spices',
  'Spice/Vegetable': 'Spices',
  'High Value/Spice': 'Spices',
  'Spice/Plantation': 'Spices',
  'Spice/Herb': 'Spices',
  'Vegetable/Spice': 'Spices',
  
  // Plantation
  'Plantation': 'Plantation',
  'Plantation Crop': 'Plantation',
  'Commercial/Plantation': 'Plantation',
  
  // Medicinal
  'Medicinal': 'Medicinal',
  'Medicinal/Sweetener': 'Medicinal',
  'Medicinal (Regulated)': 'Medicinal',
  'Medicinal/Commercial': 'Medicinal',
  'Fruit/Medicinal': 'Medicinal',
  'Aromatic/Essential Oil': 'Medicinal',
  'Aromatic/Herb': 'Medicinal',
  
  // Horticulture (Flowers & Timber)
  'Flower': 'Horticulture',
  'Flower/Essential Oil': 'Horticulture',
  'Flower/Aromatic': 'Horticulture',
  'Flower (Protected)': 'Horticulture',
  'Timber/Long-term': 'Horticulture',
  'High-Value Timber': 'Horticulture',
};

// Replace all occurrences
Object.keys(mapping).forEach(oldCat => {
  const newCat = mapping[oldCat];
  const regex = new RegExp(`category: "${oldCat}"`, 'g');
  content = content.replace(regex, `category: "${newCat}"`);
});

// Final cleanup: if anything is still not in the 10 categories, map it to Horticulture
// We can find all category: "..." and check if it's in CATEGORIES
const allCategoriesRegex = /category: "([^"]+)"/g;
content = content.replace(allCategoriesRegex, (match, cat) => {
  if (CATEGORIES.includes(cat)) return match;
  console.log(`Unmapped category found: ${cat}. Mapping to Horticulture.`);
  return `category: "Horticulture"`;
});

fs.writeFileSync(filePath, content);
console.log('Successfully updated categories in cropsData.js');
