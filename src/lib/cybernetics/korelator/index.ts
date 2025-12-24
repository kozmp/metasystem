/**
 * @fileoverview KORELATOR - Publiczne API modułu logiki i pamięci
 * @cybernetic Organ logiki systemu KMS - Retencja (pamięć operacyjna)
 * 
 * Korelator przyjmuje przetworzone sygnały z Receptora i zapisuje je
 * w pamięci trwałej (Supabase). Buduje graf wiedzy i umożliwia
 * wyszukiwanie łańcuchów sterowania.
 */

export { processAndStoreSignal } from './store';

