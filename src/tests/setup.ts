import { expect, vi } from "vitest";
import "@testing-library/jest-dom";

// Define mock types that match the actual Supabase client structure
export type MockSupabaseResponse<T> = Promise<{
  data: T | null;
  error: Error | null;
}>;

export interface MockSupabaseTable {
  insert: (data: Record<string, unknown>) => MockSupabaseResponse<unknown>;
  select: () => { single: () => MockSupabaseResponse<unknown> };
  single: () => MockSupabaseResponse<unknown>;
}

export interface MockSupabaseClient {
  from: (table: string) => MockSupabaseTable;
  // Add minimal required Supabase client properties
  supabaseUrl: string;
  supabaseKey: string;
}

// Configure global mocks
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => {
    const mockTable: MockSupabaseTable = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn(),
    };

    const mockClient: MockSupabaseClient = {
      from: vi.fn().mockReturnValue(mockTable),
      supabaseUrl: "http://localhost:54321",
      supabaseKey: "test-key",
    };

    return mockClient;
  }),
}));

// Add custom matchers if needed
expect.extend({
  // Custom matchers can be added here
});

// Mock crypto for hashing operations
vi.stubGlobal("crypto", {
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue("mocked-hash"),
  }),
});

// Helper function to create a typed mock Supabase client
export const createMockSupabaseClient = (): MockSupabaseClient => {
  const mockTable: MockSupabaseTable = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };

  return {
    from: vi.fn().mockReturnValue(mockTable),
    supabaseUrl: "http://localhost:54321",
    supabaseKey: "test-key",
  };
};
