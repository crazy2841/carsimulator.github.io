const MAX_TITLE_LENGTH = 140;
const MAX_TAG_LENGTH = 20;
const MAX_MATERIAL_LENGTH = 45;
const MATERIAL_COUNT = 13;
const TAG_COUNT = 13;

const pdfInput = document.getElementById("pdfInput");
const pdfStatus = document.getElementById("pdfStatus");
const productImage = document.getElementById("productImage");
const imagePreview = document.getElementById("imagePreview");
const generateBtn = document.getElementById("generateBtn");

const productNameEl = document.getElementById("productName");
const keywordsEl = document.getElementById("keywords");
const materialsInputEl = document.getElementById("materialsInput");
const requiredPhraseEl = document.getElementById("requiredPhrase");
const competitorTitleEl = document.getElementById("competitorTitle");
const descriptionStyleEl = document.getElementById("descriptionStyle");

const titleOutput = document.getElementById("titleOutput");
const titleLen = document.getElementById("titleLen");
const descriptionOutput = document.getElementById("descriptionOutput");
const tagsOutput = document.getElementById("tagsOutput");
const materialsOutput = document.getElementById("materialsOutput");

let seoCorpus = "";

pdfInput.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) {
    seoCorpus = "";
    pdfStatus.textContent = "Henüz PDF yüklenmedi.";
    return;
  }

  const pdfjsLib = await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

  const chunks = [];

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: buffer }).promise;
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum += 1) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str).join(" ");
      chunks.push(text);
    }
  }

  seoCorpus = chunks.join(" ").replace(/\s+/g, " ").trim();
  const wordCount = seoCorpus ? seoCorpus.split(" ").length : 0;
  pdfStatus.textContent = `${files.length} PDF işlendi. Toplam yaklaşık ${wordCount} kelime eğitim metni alındı.`;
});

productImage.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    imagePreview.src = "";
    imagePreview.classList.add("hidden");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.src = String(reader.result || "");
    imagePreview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

generateBtn.addEventListener("click", () => {
  const keywords = splitList(keywordsEl.value);
  const materialCandidates = splitList(materialsInputEl.value);

  const title = generateTitle({
    productName: productNameEl.value,
    requiredPhrase: requiredPhraseEl.value,
    competitorTitle: competitorTitleEl.value,
    keywords,
  });

  const description = generateDescription({
    title,
    keywords,
    style: descriptionStyleEl.value,
    seoCorpus,
  });

  const tags = generateTags(keywords);
  const materials = generateMaterials(materialCandidates, keywords);

  titleOutput.value = title;
  titleLen.textContent = `${title.length}/${MAX_TITLE_LENGTH}`;
  descriptionOutput.value = description;

  tagsOutput.innerHTML = "";
  tags.forEach((tag) => {
    const li = document.createElement("li");
    li.textContent = tag;
    tagsOutput.appendChild(li);
  });

  materialsOutput.innerHTML = "";
  materials.forEach((material) => {
    const li = document.createElement("li");
    li.textContent = material;
    materialsOutput.appendChild(li);
  });
});

function splitList(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanText(input) {
  return input.replace(/\s+/g, " ").trim();
}

function truncateByWords(text, maxLength) {
  if (text.length <= maxLength) return text;

  const words = text.split(" ");
  let result = "";
  for (const word of words) {
    const candidate = result ? `${result} ${word}` : word;
    if (candidate.length > maxLength) break;
    result = candidate;
  }
  return result || text.slice(0, maxLength).trim();
}

function generateTitle({ productName, requiredPhrase, competitorTitle, keywords }) {
  const blocks = [];
  const baseName = cleanText(productName || "Etsy Listing");
  blocks.push(baseName);

  if (requiredPhrase.trim()) {
    blocks.push(cleanText(requiredPhrase));
  }

  const competitorTokens = splitCompetitorTokens(competitorTitle);
  competitorTokens.slice(0, 2).forEach((token) => blocks.push(token));

  keywords.slice(0, 5).forEach((kw) => blocks.push(kw));

  const deduped = [];
  const seen = new Set();

  for (const item of blocks) {
    const normalized = item.toLowerCase();
    if (!seen.has(normalized)) {
      deduped.push(item);
      seen.add(normalized);
    }
  }

  return truncateByWords(deduped.join(" | "), MAX_TITLE_LENGTH);
}

function splitCompetitorTokens(value) {
  return value
    .split(/[|,•\-]/)
    .map((item) => cleanText(item))
    .filter((item) => item.length > 2);
}

function extractSeoHints(corpus, keywords) {
  if (!corpus) return [];
  const sentences = corpus
    .split(/[.!?]\s+/)
    .map((s) => cleanText(s))
    .filter((s) => s.length > 40 && s.length < 220);

  const ranked = sentences
    .map((sentence) => {
      const score = keywords.reduce((acc, kw) => {
        if (sentence.toLowerCase().includes(kw.toLowerCase())) return acc + 1;
        return acc;
      }, 0);
      return { sentence, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((item) => item.sentence);

  return ranked;
}

function generateDescription({ title, keywords, style, seoCorpus }) {
  const keywordLine = keywords.length
    ? `Öne çıkan anahtar kelimeler: ${keywords.slice(0, 8).join(", ")}.`
    : "Anahtar kelime bilgisi girilmedi.";

  const styleLine = style.trim()
    ? `Uygulanan stil notu: ${cleanText(style)}`
    : "Stil notu girilmedi. Açıklama varsayılan profesyonel tonda üretildi.";

  const seoHints = extractSeoHints(seoCorpus, keywords);
  const hintLine = seoHints.length
    ? `PDF eğitiminden alınan SEO ipuçları: ${seoHints.join(" ")}`
    : "PDF eğitim metninden eşleşen doğrudan ipucu bulunamadı.";

  return [
    `${title} ürününü Etsy mağazanız için optimize ettik.`,
    keywordLine,
    styleLine,
    hintLine,
    "Açıklamaya ürün ölçüsü, teslimat tipi ve kullanım alanlarını net şekilde ekleyin.",
  ].join("\n\n");
}

function generateTags(keywords) {
  const tags = [];
  const seen = new Set();

  for (const keyword of keywords) {
    const normalized = keyword.toLowerCase();
    if (normalized.length > MAX_TAG_LENGTH || seen.has(normalized)) continue;
    tags.push(keyword);
    seen.add(normalized);
    if (tags.length === TAG_COUNT) break;
  }

  if (!tags.length) {
    tags.push("etsy seo", "handmade gift", "digital download");
  }

  return tags;
}

function generateMaterials(materialCandidates, keywords) {
  const pool = [...materialCandidates, ...keywords, "paper", "canvas", "ink", "digital file"];

  const list = [];
  const seen = new Set();

  for (const item of pool) {
    const value = cleanText(item);
    if (!value || value.length > MAX_MATERIAL_LENGTH) continue;

    const normalized = value.toLowerCase();
    if (seen.has(normalized)) continue;

    list.push(value);
    seen.add(normalized);

    if (list.length === MATERIAL_COUNT) return list;
  }

  while (list.length < MATERIAL_COUNT) {
    list.push(`material ${list.length + 1}`);
  }

  return list;
}
