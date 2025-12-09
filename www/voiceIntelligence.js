// Voice Intelligence Service - Phonetic and Fuzzy Matching
// No external dependencies - pure JavaScript implementation

class VoiceIntelligence {
  constructor() {
    // Dictionary of known keywords from all categories
    this.knownKeywords = [];
  }

  // Initialize with all category/subcategory keywords
  loadDictionary(categoryKeywords) {
    this.knownKeywords = [];
    
    for (const [categoryType, categoryData] of Object.entries(categoryKeywords)) {
      // Add category keywords
      if (categoryData.keywords) {
        this.knownKeywords.push(...categoryData.keywords);
      }
      
      // Add grocery apps
      if (categoryData.apps) {
        this.knownKeywords.push(...categoryData.apps);
      }
      
      // Add subcategory items
      if (categoryData.items) {
        for (const itemList of Object.values(categoryData.items)) {
          this.knownKeywords.push(...itemList);
        }
      }
      
      // Add subcategory keywords
      if (categoryData.subcategories) {
        for (const subList of Object.values(categoryData.subcategories)) {
          this.knownKeywords.push(...subList);
        }
      }
    }
    
    // Remove duplicates
    this.knownKeywords = [...new Set(this.knownKeywords)];
    console.log(`📚 Voice Intelligence loaded ${this.knownKeywords.length} keywords`);
  }

  // Levenshtein Distance - measures edit distance between two strings
  levenshteinDistance(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    const len1 = s1.length;
    const len2 = s2.length;
    
    // Create matrix
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    // Initialize first row and column
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }
    
    return matrix[len1][len2];
  }

  // Simplified Metaphone - phonetic algorithm for English
  metaphone(word) {
    if (!word) return '';
    
    let w = word.toLowerCase().trim();
    
    // Remove non-alphabetic characters
    w = w.replace(/[^a-z]/g, '');
    
    if (w.length === 0) return '';
    
    // Apply phonetic rules
    let result = '';
    
    // Starting rules
    if (w.startsWith('kn')) w = w.substring(1);
    if (w.startsWith('gn')) w = w.substring(1);
    if (w.startsWith('pn')) w = w.substring(1);
    if (w.startsWith('wr')) w = w.substring(1);
    if (w.startsWith('ae')) w = 'e' + w.substring(2);
    
    let prev = '';
    
    for (let i = 0; i < w.length; i++) {
      const c = w[i];
      const next = i < w.length - 1 ? w[i + 1] : '';
      
      // Skip duplicate consonants
      if (c === prev && !'aeiou'.includes(c)) continue;
      
      // Phonetic transformations
      switch (c) {
        case 'b':
          if (i === w.length - 1 && prev === 'm') break;
          result += 'B';
          break;
        case 'c':
          if (next === 'h') {
            result += 'X';
            i++;
          } else if ('ei'.includes(next)) {
            result += 'S';
          } else {
            result += 'K';
          }
          break;
        case 'd':
          if (next === 'g' && 'ei'.includes(w[i + 2])) {
            result += 'J';
            i++;
          } else {
            result += 'T';
          }
          break;
        case 'g':
          if (next === 'h' && i < w.length - 2) {
            i++;
          } else if (next === 'n' && i === w.length - 2) {
            break;
          } else if ('ei'.includes(next)) {
            result += 'J';
          } else {
            result += 'K';
          }
          break;
        case 'h':
          if (!'aeiou'.includes(prev) || !'aeiou'.includes(next)) break;
          result += 'H';
          break;
        case 'k':
          if (prev !== 'c') result += 'K';
          break;
        case 'p':
          if (next === 'h') {
            result += 'F';
            i++;
          } else {
            result += 'P';
          }
          break;
        case 'q':
          result += 'K';
          break;
        case 's':
          if (next === 'h') {
            result += 'X';
            i++;
          } else if (w.substring(i, i + 3) === 'sio' || w.substring(i, i + 3) === 'sia') {
            result += 'X';
          } else {
            result += 'S';
          }
          break;
        case 't':
          if (w.substring(i, i + 3) === 'tio' || w.substring(i, i + 3) === 'tia') {
            result += 'X';
          } else if (next === 'h') {
            result += '0';
            i++;
          } else if (next !== 'c' || w[i + 2] !== 'h') {
            result += 'T';
          }
          break;
        case 'v':
          result += 'F';
          break;
        case 'w':
        case 'y':
          if ('aeiou'.includes(next)) result += c.toUpperCase();
          break;
        case 'x':
          result += 'KS';
          break;
        case 'z':
          result += 'S';
          break;
        case 'a':
        case 'e':
        case 'i':
        case 'o':
        case 'u':
          if (i === 0) result += c.toUpperCase();
          break;
      }
      
      prev = c;
    }
    
    return result || w.toUpperCase();
  }

  // Find best match using combined approach
  findBestMatch(heardWord) {
    if (!heardWord || heardWord.trim().length === 0) return null;
    
    const heard = heardWord.toLowerCase().trim();
    const heardPhonetic = this.metaphone(heard);
    
    let bestMatch = null;
    let bestScore = Infinity;
    
    for (const keyword of this.knownKeywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Direct match (score: 0)
      if (keywordLower === heard) {
        return { word: keyword, method: 'exact', score: 0 };
      }
      
      // Calculate edit distance
      const editDistance = this.levenshteinDistance(heard, keywordLower);
      
      // Calculate phonetic distance
      const keywordPhonetic = this.metaphone(keyword);
      const phoneticDistance = this.levenshteinDistance(heardPhonetic, keywordPhonetic);
      
      // Combined score (weighted)
      const combinedScore = editDistance * 0.6 + phoneticDistance * 0.4;
      
      if (combinedScore < bestScore) {
        bestScore = combinedScore;
        bestMatch = {
          word: keyword,
          method: editDistance < phoneticDistance ? 'edit-distance' : 'phonetic',
          score: combinedScore,
          editDistance: editDistance,
          phoneticDistance: phoneticDistance
        };
      }
    }
    
    // Only return if confidence is high (score < threshold)
    const threshold = 2.5; // Stricter threshold for accurate matching (lower = more accurate)
    if (bestMatch && bestScore < threshold) {
      return bestMatch;
    }
    
    return null;
  }

  // Correct entire phrase intelligently
  correctPhrase(phrase) {
    if (!phrase) return phrase;
    
    // Common English words that should NOT be corrected
    const commonWords = ['fast', 'fastech', 'tag', 'recharge', 'tech', 'the', 'and', 'or', 'for', 'with', 'from', 'to', 'in', 'on', 'at', 'by', 'fruits', 'fruit', 'vegetables', 'vegetable', 'milk', 'eggs', 'bread', 'rice', 'dal', 'oil', 'electricity', 'water', 'gas', 'bill', 'bills', 'rent', 'groceries', 'grocery', 'food', 'coffee', 'tea', 'lunch', 'dinner', 'breakfast', 'snacks', 'medicine', 'medical', 'doctor', 'hospital', 'hotel', 'motel', 'stay', 'room', 'travel', 'trip', 'city', 'surat', 'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'plants', 'plant', 'flowers', 'garden', 'school', 'fees', 'tuition', 'education', 'college', 'university', 'books', 'stationery', 'ironing', 'iron', 'clothes', 'laundry', 'washing', 'cleaning'];
    
    const words = phrase.split(/\s+/);
    const correctedWords = [];
    
    for (const word of words) {
      const lowerWord = word.toLowerCase();
      
      // Skip very short words, numbers, or common English words
      if (word.length <= 2 || /^\d+$/.test(word) || commonWords.includes(lowerWord)) {
        correctedWords.push(word);
        continue;
      }
      
      const match = this.findBestMatch(word);
      
      if (match) {
        console.log(`🧠 Intelligent match: "${word}" → "${match.word}" (${match.method}, score: ${match.score.toFixed(2)})`);
        correctedWords.push(match.word);
      } else {
        correctedWords.push(word);
      }
    }
    
    return correctedWords.join(' ');
  }
}

// Export for use in app.js
window.VoiceIntelligence = VoiceIntelligence;
