/**
 * @fileoverview Receptor RSS Monitor - Automatyczny monitoring kanałów RSS
 * @cybernetic Autonomiczny zwiadowca - pasywny odbiór sygnałów z otoczenia
 * 
 * Zgodnie z teorią Kosseckiego:
 * - Receptor może działać w trybie AKTYWNYM (scraping) lub PASYWNYM (RSS)
 * - Monitoring RSS to stały nasłuch zmian w otoczeniu informacyjnym
 * - Każdy nowy wpis jest automatycznie przetwarzany przez Receptor → Korelator
 */

import { parseString } from 'xml2js';
import { promisify } from 'util';
import { scrapeAndProcess, type ProcessedScrapeResult } from './scraper';

const parseXML = promisify(parseString);

// ============================================================================
// TYPY
// ============================================================================

/**
 * @cybernetic Definicja źródła RSS
 */
export interface RSSSource {
  name: string;
  url: string;
  category: 'news' | 'science' | 'tech' | 'politics' | 'economics' | 'other';
  reliability_bias?: number; // Wstępny bias rzetelności (0-1)
  enabled: boolean;
}

/**
 * @cybernetic Pojedynczy wpis z RSS
 */
export interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  guid?: string;
  author?: string;
}

/**
 * @cybernetic Wynik przetworzenia RSS feed
 */
export interface RSSFeedResult {
  source: RSSSource;
  success: boolean;
  items_found: number;
  items_processed: number;
  items: RSSItem[];
  error?: string;
}

/**
 * @cybernetic Raport z pełnego cyklu monitoringu
 */
export interface RSSMonitorReport {
  total_sources: number;
  sources_checked: number;
  sources_failed: number;
  total_items_found: number;
  total_items_processed: number;
  results: RSSFeedResult[];
  errors: string[];
}

// ============================================================================
// KONFIGURACJA ŹRÓDEŁ RSS
// ============================================================================

/**
 * @cybernetic Lista domyślnych źródeł RSS
 * 
 * Rygor Kosseckiego: Różnorodność źródeł z różnych systemów sterowania
 * - Cognitive: źródła naukowe, badawcze
 * - Ideological: źródła polityczne, doktrynalne (z flagą ostrzegawczą)
 * - Economic: źródła biznesowe, gospodarcze
 */
export const DEFAULT_RSS_SOURCES: RSSSource[] = [
  // NAUKA I TECHNOLOGIA (Cognitive)
  {
    name: 'Nature - Latest Research',
    url: 'https://www.nature.com/nature.rss',
    category: 'science',
    reliability_bias: 0.9, // Wysoka rzetelność
    enabled: true,
  },
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/feed/',
    category: 'tech',
    reliability_bias: 0.85,
    enabled: true,
  },
  {
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    category: 'tech',
    reliability_bias: 0.7,
    enabled: true,
  },
  
  // WIADOMOŚCI OGÓLNE (Mixed)
  {
    name: 'Reuters - World News',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    category: 'news',
    reliability_bias: 0.75,
    enabled: true,
  },
  {
    name: 'BBC News - World',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'news',
    reliability_bias: 0.7,
    enabled: true,
  },
  
  // EKONOMIA (Economic)
  {
    name: 'Financial Times',
    url: 'https://www.ft.com/?format=rss',
    category: 'economics',
    reliability_bias: 0.75,
    enabled: true,
  },
  {
    name: 'The Economist',
    url: 'https://www.economist.com/rss',
    category: 'economics',
    reliability_bias: 0.8,
    enabled: true,
  },
  
  // POLITYKA (Ideological - OSTRZEŻENIE)
  {
    name: 'Politico',
    url: 'https://www.politico.com/rss/politics08.xml',
    category: 'politics',
    reliability_bias: 0.5, // Średnia - wymaga weryfikacji
    enabled: false, // Domyślnie wyłączone
  },
];

// ============================================================================
// KONFIGURACJA
// ============================================================================

const RSS_CONFIG = {
  TIMEOUT_MS: 10000, // 10 sekund na pobranie RSS
  MAX_ITEMS_PER_FEED: 10, // Max liczba wpisów do przetworzenia na feed
  USER_AGENT: 'KOSSECKI-METASYSTEM/1.0 RSS Monitor',
};

// ============================================================================
// FUNKCJE RSS PARSING
// ============================================================================

/**
 * @cybernetic Pobieranie i parsowanie RSS feed
 * 
 * @param url - URL kanału RSS
 * @returns Lista wpisów z RSS
 */
async function fetchRSSFeed(url: string): Promise<RSSItem[]> {
  console.log(`[RSS] Pobieranie feed: ${url}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RSS_CONFIG.TIMEOUT_MS);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': RSS_CONFIG.USER_AGENT,
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const parsed = await parseXML(xmlText);
    
    // Obsługa RSS 2.0
    if (parsed.rss && parsed.rss.channel && parsed.rss.channel[0].item) {
      const items = parsed.rss.channel[0].item.map((item: any) => ({
        title: item.title?.[0] || 'Bez tytułu',
        link: item.link?.[0] || '',
        description: item.description?.[0] || '',
        pubDate: item.pubDate?.[0] || '',
        guid: item.guid?.[0]?._|| item.guid?.[0] || '',
        author: item.author?.[0] || item['dc:creator']?.[0] || '',
      }));
      
      return items;
    }
    
    // Obsługa Atom
    if (parsed.feed && parsed.feed.entry) {
      const items = parsed.feed.entry.map((entry: any) => ({
        title: entry.title?.[0]?._ || entry.title?.[0] || 'Bez tytułu',
        link: entry.link?.[0]?.$?.href || '',
        description: entry.summary?.[0]?._ || entry.summary?.[0] || '',
        pubDate: entry.published?.[0] || entry.updated?.[0] || '',
        guid: entry.id?.[0] || '',
        author: entry.author?.[0]?.name?.[0] || '',
      }));
      
      return items;
    }
    
    throw new Error('Nierozpoznany format RSS/Atom');
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Timeout: Przekroczono ${RSS_CONFIG.TIMEOUT_MS}ms`);
    }
    throw error;
  }
}

/**
 * @cybernetic Przetworzenie pojedynczego RSS feed
 * 
 * Proces:
 * 1. Pobranie i parsowanie RSS
 * 2. Filtrowanie nowych wpisów (TODO: sprawdzanie w bazie czy już istnieją)
 * 3. Przetworzenie każdego wpisu przez scraper
 * 
 * @param source - Źródło RSS do przetworzenia
 * @param processItems - Czy faktycznie przetwarzać wpisy (domyślnie true)
 * @returns Raport z przetworzenia feed
 */
export async function processRSSFeed(
  source: RSSSource, 
  processItems: boolean = true
): Promise<RSSFeedResult> {
  console.log(`[RSS] Przetwarzanie źródła: ${source.name}`);
  
  if (!source.enabled) {
    console.log(`[RSS] Źródło wyłączone: ${source.name}`);
    return {
      source,
      success: true,
      items_found: 0,
      items_processed: 0,
      items: [],
    };
  }
  
  try {
    // Pobranie RSS
    const items = await fetchRSSFeed(source.url);
    console.log(`[RSS] Znaleziono ${items.length} wpisów w ${source.name}`);
    
    if (!processItems) {
      return {
        source,
        success: true,
        items_found: items.length,
        items_processed: 0,
        items,
      };
    }
    
    // Ogranicz liczbę wpisów
    const itemsToProcess = items.slice(0, RSS_CONFIG.MAX_ITEMS_PER_FEED);
    let processedCount = 0;
    
    // Przetwórz każdy wpis
    for (const item of itemsToProcess) {
      if (!item.link) {
        console.warn(`[RSS] Pomijam wpis bez linka: ${item.title}`);
        continue;
      }
      
      console.log(`[RSS] Przetwarzam wpis: ${item.title}`);
      
      try {
        // Scraping + Przetworzenie przez Receptor
        const result = await scrapeAndProcess(item.link);
        
        if (result.success) {
          processedCount++;
          console.log(`[RSS] ✓ Przetworzono: ${item.title}`);
        } else {
          console.warn(`[RSS] ✗ Błąd przetwarzania: ${item.title} - ${result.error}`);
        }
        
        // Delay między requestami (aby nie przeciążyć serwera)
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
        
      } catch (error) {
        console.error(`[RSS] Błąd przetwarzania wpisu "${item.title}":`, error);
      }
    }
    
    console.log(`[RSS] ✓ Przetworzono ${processedCount}/${itemsToProcess.length} wpisów z ${source.name}`);
    
    return {
      source,
      success: true,
      items_found: items.length,
      items_processed: processedCount,
      items: itemsToProcess,
    };
    
  } catch (error) {
    console.error(`[RSS] Błąd przetwarzania źródła ${source.name}:`, error);
    return {
      source,
      success: false,
      items_found: 0,
      items_processed: 0,
      items: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * @cybernetic Pełny cykl monitoringu RSS - sprawdzanie wszystkich źródeł
 * 
 * Jest to główna funkcja autonomicznego zwiadu RSS
 * 
 * @param sources - Lista źródeł do sprawdzenia (domyślnie DEFAULT_RSS_SOURCES)
 * @param processItems - Czy faktycznie przetwarzać wpisy (false = tylko lista)
 * @returns Pełny raport z monitoringu
 */
export async function checkFeeds(
  sources: RSSSource[] = DEFAULT_RSS_SOURCES,
  processItems: boolean = true
): Promise<RSSMonitorReport> {
  console.log(`[RSS] ═══════════════════════════════════════════════════`);
  console.log(`[RSS] ROZPOCZYNAM CYKL MONITORINGU RSS`);
  console.log(`[RSS] Liczba źródeł: ${sources.length}`);
  console.log(`[RSS] Tryb: ${processItems ? 'PEŁNY' : 'TYLKO LISTA'}`);
  console.log(`[RSS] ═══════════════════════════════════════════════════`);
  
  const results: RSSFeedResult[] = [];
  const errors: string[] = [];
  let sourcesChecked = 0;
  let sourcesFailed = 0;
  let totalItemsFound = 0;
  let totalItemsProcessed = 0;
  
  for (const source of sources) {
    sourcesChecked++;
    
    try {
      const result = await processRSSFeed(source, processItems);
      results.push(result);
      
      totalItemsFound += result.items_found;
      totalItemsProcessed += result.items_processed;
      
      if (!result.success) {
        sourcesFailed++;
        if (result.error) {
          errors.push(`${source.name}: ${result.error}`);
        }
      }
      
    } catch (error) {
      sourcesFailed++;
      const errorMsg = `${source.name}: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      console.error(`[RSS] Krytyczny błąd dla źródła ${source.name}:`, error);
    }
  }
  
  console.log(`[RSS] ═══════════════════════════════════════════════════`);
  console.log(`[RSS] CYKL MONITORINGU ZAKOŃCZONY`);
  console.log(`[RSS] Sprawdzono źródeł: ${sourcesChecked}`);
  console.log(`[RSS] Błędów: ${sourcesFailed}`);
  console.log(`[RSS] Znalezionych wpisów: ${totalItemsFound}`);
  console.log(`[RSS] Przetworzonych wpisów: ${totalItemsProcessed}`);
  console.log(`[RSS] ═══════════════════════════════════════════════════`);
  
  return {
    total_sources: sources.length,
    sources_checked: sourcesChecked,
    sources_failed: sourcesFailed,
    total_items_found: totalItemsFound,
    total_items_processed: totalItemsProcessed,
    results,
    errors,
  };
}

/**
 * @cybernetic Export publicznych funkcji
 */
export default {
  checkFeeds,
  processRSSFeed,
  DEFAULT_RSS_SOURCES,
};

