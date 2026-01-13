/**
 * @fileoverview Testy dla Homeostat Security Layer
 * @cybernetic Weryfikacja poprawności działania homeostatu
 */

import { describe, it, expect } from '@jest/globals';
import { 
  validateOperation, 
  isOperationSafe,
  requiresUserConfirmation,
  formatSecurityDecision,
  type Operation,
} from './security-layer';

// ============================================================================
// TESTY: SQL DANGEROUS PATTERNS
// ============================================================================

describe('Security Layer - SQL Patterns', () => {
  
  it('powinien ZABLOKOWAĆ DELETE bez WHERE', () => {
    const operation: Operation = {
      type: 'sql_query',
      payload: 'DELETE FROM cybernetic_objects;',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'CRITICAL');
    expect(decision).toHaveProperty('reason');
  });
  
  it('powinien ZABLOKOWAĆ DROP TABLE', () => {
    const operation: Operation = {
      type: 'sql_query',
      payload: 'DROP TABLE correlations;',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'CRITICAL');
  });
  
  it('powinien ZABLOKOWAĆ TRUNCATE TABLE', () => {
    const operation: Operation = {
      type: 'sql_query',
      payload: 'TRUNCATE TABLE system_alerts;',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'CRITICAL');
  });
  
  it('powinien ZAPYTAĆ o DELETE z WHERE (cybernetic_objects)', () => {
    const operation: Operation = {
      type: 'data_delete',
      payload: 'DELETE FROM cybernetic_objects WHERE id = 123;',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('ask_user');
    expect(decision).toHaveProperty('severity', 'HIGH');
    expect(decision).toHaveProperty('message');
  });
  
  it('powinien ZAPYTAĆ o UPDATE cybernetic_objects', () => {
    const operation: Operation = {
      type: 'sql_query',
      payload: 'UPDATE cybernetic_objects SET power_v = 100 WHERE id = 1;',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('ask_user');
    expect(decision).toHaveProperty('severity', 'MEDIUM');
  });
  
  it('powinien DOZWOLIĆ SELECT', () => {
    const operation: Operation = {
      type: 'sql_query',
      payload: 'SELECT * FROM cybernetic_objects LIMIT 10;',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('allow');
  });
  
  it('powinien DOZWOLIĆ INSERT', () => {
    const operation: Operation = {
      type: 'sql_query',
      payload: 'INSERT INTO cybernetic_objects (label, type) VALUES (\'Test\', \'autonomous_system\');',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('allow');
  });
});

// ============================================================================
// TESTY: API KEY PATTERNS
// ============================================================================

describe('Security Layer - API Key Protection', () => {
  
  it('powinien ZABLOKOWAĆ ekspozycję SUPABASE_KEY', () => {
    const operation: Operation = {
      type: 'api_call',
      payload: 'Mój klucz to: SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'CRITICAL');
    expect(decision).toHaveProperty('reason');
    if (decision.action === 'block') {
      expect(decision.reason).toContain('Supabase');
    }
  });
  
  it('powinien ZABLOKOWAĆ ekspozycję GEMINI_API_KEY', () => {
    const operation: Operation = {
      type: 'api_call',
      payload: 'GEMINI_API_KEY=AIzaSyDQev279vUiP5wCncKQ3Tydbd0qa3ywIYY',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'CRITICAL');
  });
  
  it('powinien ZABLOKOWAĆ ekspozycję JWT token', () => {
    const operation: Operation = {
      type: 'api_call',
      payload: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'CRITICAL');
  });
  
  it('powinien DOZWOLIĆ tekst bez kluczy API', () => {
    const operation: Operation = {
      type: 'api_call',
      payload: 'To jest normalny tekst bez żadnych sekretów',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('allow');
  });
});

// ============================================================================
// TESTY: FILE PATTERNS
// ============================================================================

describe('Security Layer - File Protection', () => {
  
  it('powinien ZABLOKOWAĆ modyfikację .env', () => {
    const operation: Operation = {
      type: 'file_write',
      payload: 'GEMINI_API_KEY=new_key',
      target: '.env',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'CRITICAL');
  });
  
  it('powinien ZABLOKOWAĆ modyfikację PDF Kosseckiego', () => {
    const operation: Operation = {
      type: 'file_write',
      payload: 'modified content',
      target: 'METACYBERNETYKA - Józef Kossecki 2015_compressed.pdf',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'CRITICAL');
  });
  
  it('powinien ZABLOKOWAĆ usunięcie migracji', () => {
    const operation: Operation = {
      type: 'file_delete',
      payload: '',
      target: 'migrations/001_metacybernetyka_2015_retencja.sql',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'HIGH');
  });
  
  it('powinien ZAPYTAĆ o modyfikację constants.ts', () => {
    const operation: Operation = {
      type: 'file_write',
      payload: 'export const NEW_CONSTANT = 42;',
      target: 'src/lib/cybernetics/constants.ts',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('ask_user');
    expect(decision).toHaveProperty('severity', 'HIGH');
  });
  
  it('powinien DOZWOLIĆ zapis do zwykłego pliku', () => {
    const operation: Operation = {
      type: 'file_write',
      payload: 'test content',
      target: 'src/components/TestComponent.tsx',
    };
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('allow');
  });
});

// ============================================================================
// TESTY: FUNKCJE POMOCNICZE
// ============================================================================

describe('Security Layer - Helper Functions', () => {
  
  it('isOperationSafe() powinno zwrócić true dla bezpiecznej operacji', () => {
    const operation: Operation = {
      type: 'sql_query',
      payload: 'SELECT * FROM cybernetic_objects;',
    };
    
    expect(isOperationSafe(operation)).toBe(true);
  });
  
  it('isOperationSafe() powinno zwrócić false dla niebezpiecznej operacji', () => {
    const operation: Operation = {
      type: 'sql_query',
      payload: 'DROP TABLE cybernetic_objects;',
    };
    
    expect(isOperationSafe(operation)).toBe(false);
  });
  
  it('requiresUserConfirmation() powinno zwrócić true dla operacji wymagającej potwierdzenia', () => {
    const operation: Operation = {
      type: 'data_delete',
      payload: 'DELETE FROM cybernetic_objects WHERE id = 1;',
    };
    
    expect(requiresUserConfirmation(operation)).toBe(true);
  });
  
  it('requiresUserConfirmation() powinno zwrócić false dla bezpiecznej operacji', () => {
    const operation: Operation = {
      type: 'sql_query',
      payload: 'SELECT * FROM cybernetic_objects;',
    };
    
    expect(requiresUserConfirmation(operation)).toBe(false);
  });
  
  it('formatSecurityDecision() powinno sformatować decyzję allow', () => {
    const formatted = formatSecurityDecision({ action: 'allow' });
    expect(formatted).toContain('✓');
    expect(formatted).toContain('dozwolona');
  });
  
  it('formatSecurityDecision() powinno sformatować decyzję block', () => {
    const formatted = formatSecurityDecision({
      action: 'block',
      reason: 'Test reason',
      severity: 'CRITICAL',
    });
    expect(formatted).toContain('✗');
    expect(formatted).toContain('BLOKADA');
    expect(formatted).toContain('CRITICAL');
  });
  
  it('formatSecurityDecision() powinno sformatować decyzję ask_user', () => {
    const formatted = formatSecurityDecision({
      action: 'ask_user',
      message: 'Test message',
      context: {},
      severity: 'HIGH',
    });
    expect(formatted).toContain('⚠');
    expect(formatted).toContain('WYMAGA POTWIERDZENIA');
  });
});

// ============================================================================
// TESTY: WALIDACJA SCHEMATU
// ============================================================================

describe('Security Layer - Schema Validation', () => {
  
  it('powinien ZABLOKOWAĆ operację z nieprawidłowym schematem', () => {
    const operation = {
      type: 'invalid_type', // Nieprawidłowy typ
      payload: 'test',
    } as any;
    
    const decision = validateOperation(operation);
    
    expect(decision.action).toBe('block');
    expect(decision).toHaveProperty('severity', 'HIGH');
    if (decision.action === 'block') {
      expect(decision.reason).toContain('Nieprawidłowa struktura');
    }
  });
  
  it('powinien zaakceptować operację z prawidłowym schematem (object payload)', () => {
    const operation: Operation = {
      type: 'api_call',
      payload: { key: 'value', nested: { data: 123 } },
    };
    
    const decision = validateOperation(operation);
    
    // Nie powinno być błędu walidacji schematu
    if (decision.action === 'block') {
      expect(decision.reason).not.toContain('Nieprawidłowa struktura');
    }
  });
});

// ============================================================================
// TESTY: CASE INSENSITIVE
// ============================================================================

describe('Security Layer - Case Insensitive Matching', () => {
  
  it('powinien wykryć DELETE niezależnie od wielkości liter', () => {
    const operations = [
      'DELETE FROM users;',
      'delete from users;',
      'DeLeTe FrOm users;',
    ];
    
    operations.forEach(payload => {
      const decision = validateOperation({
        type: 'sql_query',
        payload,
      });
      
      expect(decision.action).toBe('block');
    });
  });
  
  it('powinien wykryć DROP TABLE niezależnie od wielkości liter', () => {
    const operations = [
      'DROP TABLE users;',
      'drop table users;',
      'DrOp TaBlE users;',
    ];
    
    operations.forEach(payload => {
      const decision = validateOperation({
        type: 'sql_query',
        payload,
      });
      
      expect(decision.action).toBe('block');
    });
  });
});

