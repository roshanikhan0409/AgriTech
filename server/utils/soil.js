// Simple rule-based soil analysis. Thresholds are general guidance values,
// not agronomic prescriptions; tune per crop/region with local expert input.
exports.soilRecommendations = (reading, cropName = '') => {
  if (!reading) return [];
  const recs = [];
  const add = (level, text) => recs.push({ level, text });

  if (reading.moisture != null) {
    if (reading.moisture < 20) add('high', 'Soil moisture is low. Irrigate soon.');
    else if (reading.moisture > 80) add('medium', 'Soil is waterlogged. Improve drainage and pause irrigation.');
    else add('ok', 'Soil moisture is in a healthy range.');
  }
  if (reading.ph != null) {
    if (reading.ph < 5.5) add('medium', 'Soil is acidic (pH < 5.5). Consider applying lime.');
    else if (reading.ph > 8) add('medium', 'Soil is alkaline (pH > 8). Consider gypsum or organic matter.');
    else add('ok', 'Soil pH is suitable for most crops.');
  }
  if (reading.nitrogen != null) {
    if (reading.nitrogen < 280) add('medium', 'Nitrogen is low. Apply a nitrogen source such as urea or compost.');
    else add('ok', 'Nitrogen level is adequate.');
  }
  if (reading.phosphorus != null) {
    if (reading.phosphorus < 10) add('medium', 'Phosphorus is low. Consider DAP or single super phosphate.');
    else add('ok', 'Phosphorus level is adequate.');
  }
  if (reading.potassium != null) {
    if (reading.potassium < 110) add('medium', 'Potassium is low. Consider muriate of potash.');
    else add('ok', 'Potassium level is adequate.');
  }
  return recs;
};
