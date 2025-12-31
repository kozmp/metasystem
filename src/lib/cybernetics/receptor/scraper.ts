/**
 * @fileoverview Receptor Scraper - Pobieranie i czyszczenie treści ze stron WWW
 * @cybernetic Autonomiczny zwiadowca - ekstrakcja sygnałów z otoczenia informacyjnego
 * 
 * Zgodnie z teorią Kosseckiego:
 * - Receptor musi aktywnie poszukiwać bodźców w otoczeniu (skanowanie terenu)
 * - Każdy bodziec zewnętrzny musi być oczyszczony z szumu technicznego (HTML)
 * - Źródło musi być śledzone dla późniejszej weryfikacji rzetelności
 */

import * as cheerio from 'cheerio';
import { processAndStoreSignal } from '../korelator/store';

// ============================================================================
// TYPY
// ============================================================================

/**
 * @cybernetic Wynik operacji scrapingu
 */
export interface ScrapeResult {
  success: boolean;
  url: string;
  title?: string;
  content?: string;
  extracted_text_length?: number;
  metadata?: {
    author?: string;
    published_date?: string;
    description?: string;
  };
  error?: string;
}

/**
 * @cybernetic Wynik przetworzenia i zapisu sygnału
 */
export interface ProcessedScrapeResult extends ScrapeResult {
  raw_signal_id?: string;
  objects_created?: number;
  relations_created?: number;
  certainty_score?: number;
}

// ============================================================================
// KONFIGURACJA
// ============================================================================

/**
 * @cybernetic Konfiguracja timeoutów i limitów
 * Zgodnie z zasadą homeostazy - system nie może czekać w nieskończoność
 */
const SCRAPER_CONFIG = {
  TIMEOUT_MS: 15000, // 15 sekund na pobranie strony
  MAX_CONTENT_LENGTH: 50000, // Max 50k znaków (limit Receptora)
  USER_AGENT: 'KOSSECKI-METASYSTEM/1.0 (Autonomous Research Bot; +https://github.com/kossecki)',
  MAX_REDIRECTS: 3,
};

// ============================================================================
// FUNKCJE CZYSZCZĄCE
// ============================================================================

/**
 * @cybernetic Czyszczenie HTML - ekstrakcja czystego tekstu
 * 
 * Proces:
 * 1. Usunięcie skryptów, stylów, reklam
 * 2. Ekstrakcja głównej treści (artykuł, paragraf)
 * 3. Normalizacja białych znaków
 * 4. Usunięcie nadmiarowych linków nawigacyjnych
 */
function cleanHTML(html: string, url: string): { text: string; title?: string; metadata?: any } {
  const $ = cheerio.load(html);
  
  // Usuń śmieci techniczne
  $('script, style, nav, footer, header, aside, .ad, .advertisement, .cookie-notice').remove();
  
  // Ekstrakcja metadanych
  const title = $('title').text().trim() || 
                $('meta[property="og:title"]').attr('content') || 
                $('h1').first().text().trim();
                
  const description = $('meta[name="description"]').attr('content') || 
                      $('meta[property="og:description"]').attr('content');
                      
  const author = $('meta[name="author"]').attr('content') || 
                 $('[rel="author"]').text().trim();
                 
  const publishedDate = $('meta[property="article:published_time"]').attr('content') ||
                        $('time[datetime]').attr('datetime');
  
  // Ekstrakcja głównej treści
  // Priorytetyzuj semantyczne znaczniki HTML5
  let mainContent = $('article').text() || 
                    $('main').text() || 
                    $('#content').text() || 
                    $('.content').text() ||
                    $('.article').text() ||
                    $('body').text();
  
  // Normalizacja białych znaków
  mainContent = mainContent
    .replace(/\s+/g, ' ') // Zmień wiele spacji na jedną
    .replace(/\n\s*\n/g, '\n\n') // Max 2 linie przerwy
    .trim();
  
  return {
    text: mainContent,
    title,
    metadata: {
      author,
      published_date: publishedDate,
      description,
    },
  };
}

/**
 * @cybernetic Walidacja URL
 * Sprawdza czy URL jest prawidłowy i bezpieczny
 */
function isValidURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    // Tylko http/https
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ============================================================================
// GŁÓWNA FUNKCJA SCRAPINGU
// ============================================================================

/**
 * @cybernetic Pobieranie i ekstrakcja treści ze strony WWW
 * 
 * Proces:
 * 1. Walidacja URL
 * 2. Pobranie HTML (fetch z timeoutem)
 * 3. Czyszczenie HTML → czysty tekst
 * 4. Zwrot wyniku
 * 
 * @param url - Adres URL strony do przetworzenia
 * @returns Wynik scrapingu z czystym tekstem
 */
export async function scrapeURL(url: string): Promise<ScrapeResult> {
  console.log(`[SCRAPER] Rozpoczynam scraping: ${url}`);
  
  // Walidacja URL
  if (!isValidURL(url)) {
    console.error(`[SCRAPER] Nieprawidłowy URL: ${url}`);
    return {
      success: false,
      url,
      error: 'Nieprawidłowy format URL. Wymagany protokół http:// lub https://',
    };
  }
  
  try {
    // Pobranie HTML z timeoutem
    console.log(`[SCRAPER] Pobieranie HTML...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SCRAPER_CONFIG.TIMEOUT_MS);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': SCRAPER_CONFIG.USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pl,en-US;q=0.7,en;q=0.3',
      },
      redirect: 'follow',
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`[SCRAPER] HTTP Error ${response.status}: ${response.statusText}`);
      return {
        success: false,
        url,
        error: `HTTP Error ${response.status}: ${response.statusText}`,
      };
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      console.error(`[SCRAPER] Nieprawidłowy Content-Type: ${contentType}`);
      return {
        success: false,
        url,
        error: `Nieprawidłowy typ treści: ${contentType}. Wymagany text/html.`,
      };
    }
    
    const html = await response.text();
    console.log(`[SCRAPER] Pobrano ${html.length} znaków HTML`);
    
    // Czyszczenie HTML
    console.log(`[SCRAPER] Czyszczenie HTML...`);
    const { text, title, metadata } = cleanHTML(html, url);
    
    // Walidacja długości
    if (text.length === 0) {
      console.error(`[SCRAPER] Brak treści po czyszczeniu HTML`);
      return {
        success: false,
        url,
        error: 'Nie udało się wyekstrahować treści ze strony. Strona może być pusta lub wymagać JavaScript.',
      };
    }
    
    if (text.length > SCRAPER_CONFIG.MAX_CONTENT_LENGTH) {
      console.warn(`[SCRAPER] Treść przekracza limit (${text.length} > ${SCRAPER_CONFIG.MAX_CONTENT_LENGTH}). Obcinam.`);
      const truncatedText = text.substring(0, SCRAPER_CONFIG.MAX_CONTENT_LENGTH);
      
      return {
        success: true,
        url,
        title,
        content: truncatedText,
        extracted_text_length: truncatedText.length,
        metadata,
      };
    }
    
    console.log(`[SCRAPER] ✓ Scraping zakończony pomyślnie`);
    console.log(`[SCRAPER]   Tytuł: ${title || 'brak'}`);
    console.log(`[SCRAPER]   Długość tekstu: ${text.length} znaków`);
    
    return {
      success: true,
      url,
      title,
      content: text,
      extracted_text_length: text.length,
      metadata,
    };
    
  } catch (error) {
    console.error(`[SCRAPER] Błąd podczas scrapingu:`, error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        url,
        error: `Timeout: Przekroczono limit czasu (${SCRAPER_CONFIG.TIMEOUT_MS}ms)`,
      };
    }
    
    return {
      success: false,
      url,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * @cybernetic Pełny proces: Scraping + Przetworzenie przez Receptor + Zapis w Korelatorze
 * 
 * Jest to główna funkcja Receptora 2.0 - autonomiczny zwiadu
 * 
 * Przepływ:
 * 1. Scraping URL → czysty tekst
 * 2. Przekazanie do processAndStoreSignal (Receptor → Korelator)
 * 3. Zwrot pełnego raportu
 * 
 * @param url - Adres URL do przetworzenia
 * @returns Pełny raport: scraping + przetworzenie + zapis
 */
export async function scrapeAndProcess(url: string): Promise<ProcessedScrapeResult> {
  console.log(`[SCRAPER] Rozpoczynam pełny cykl zwiadu dla: ${url}`);
  
  // Krok 1: Scraping
  const scrapeResult = await scrapeURL(url);
  
  if (!scrapeResult.success || !scrapeResult.content) {
    console.error(`[SCRAPER] Scraping nie powiódł się: ${scrapeResult.error}`);
    return {
      ...scrapeResult,
      objects_created: 0,
      relations_created: 0,
    };
  }
  
  // Krok 2: Przetworzenie przez Receptor + Zapis w Korelatorze
  console.log(`[SCRAPER] Przekazuję sygnał do Receptora/Korelatora...`);
  
  // Dodaj kontekst źródła do treści
  const enrichedContent = `ŹRÓDŁO: ${url}\nTYTUŁ: ${scrapeResult.title || 'brak'}\n\n${scrapeResult.content}`;
  
  // Przekaż metadane źródła
  const processResult = await processAndStoreSignal(enrichedContent, {
    source_url: url,
    source_title: scrapeResult.title,
    author: scrapeResult.metadata?.author,
    published_date: scrapeResult.metadata?.published_date,
    description: scrapeResult.metadata?.description,
  });
  
  if (!processResult.success) {
    console.error(`[SCRAPER] Przetworzenie nie powiodło się: ${processResult.error}`);
    return {
      ...scrapeResult,
      raw_signal_id: processResult.raw_signal_id,
      objects_created: processResult.objects_created,
      relations_created: processResult.relations_created,
      error: processResult.error,
    };
  }
  
  console.log(`[SCRAPER] ✅ Pełny cykl zwiadu zakończony pomyślnie`);
  console.log(`[SCRAPER]   URL: ${url}`);
  console.log(`[SCRAPER]   Raw Signal ID: ${processResult.raw_signal_id}`);
  console.log(`[SCRAPER]   Utworzono obiektów: ${processResult.objects_created}`);
  console.log(`[SCRAPER]   Utworzono relacji: ${processResult.relations_created}`);
  console.log(`[SCRAPER]   Certainty Score: ${processResult.certainty_score?.toFixed(2)}`);
  
  return {
    ...scrapeResult,
    raw_signal_id: processResult.raw_signal_id,
    objects_created: processResult.objects_created,
    relations_created: processResult.relations_created,
    certainty_score: processResult.certainty_score,
  };
}

/**
 * @cybernetic Export publicznych funkcji
 */
export default {
  scrapeURL,
  scrapeAndProcess,
};

