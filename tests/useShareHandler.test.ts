/**
 * Test: useShareHandler deferred URL processing
 * 
 * This test verifies that when a share deep link arrives before authentication,
 * the URL is stored and processed once the session becomes available.
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useShareHandler } from '@/hooks/useShareHandler';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useSession } from '@/hooks/useSession';

// Mock dependencies
jest.mock('expo-linking');
jest.mock('expo-router');
jest.mock('@/hooks/useSession');
jest.mock('expo-constants', () => ({
  ExecutionEnvironment: { StoreClient: 'storeClient' },
  default: { executionEnvironment: 'standalone' },
}));

describe('useShareHandler - Deferred URL Processing', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should defer share URL when session is not available', async () => {
    // Simulate app launch with share deep link but no session
    const mockInitialUrl = 'nestly://?url=https%3A%2F%2Finstagram.com%2Fp%2Ftest123';
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(mockInitialUrl);
    (Linking.addEventListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
    
    // No session initially
    (useSession as jest.Mock).mockReturnValue({ session: null });
    
    const { rerender } = renderHook(() => useShareHandler());
    
    await waitFor(() => {
      // Should NOT navigate yet
      expect(mockPush).not.toHaveBeenCalled();
    });
    
    // Now session becomes available
    (useSession as jest.Mock).mockReturnValue({ 
      session: { user: { id: 'user-123' } } 
    });
    
    rerender();
    
    await waitFor(() => {
      // Should now navigate with the deferred URL
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/modals/add-link?url=https%3A%2F%2Finstagram.com%2Fp%2Ftest123')
      );
    });
  });

  it('should immediately process share URL when session is available', async () => {
    const mockInitialUrl = 'nestly://?url=https%3A%2F%2Ftiktok.com%2F%40user%2Fvideo%2F123';
    (Linking.getInitialURL as jest.Mock).mockResolvedValue(mockInitialUrl);
    (Linking.addEventListener as jest.Mock).mockReturnValue({ remove: jest.fn() });
    
    // Session already available
    (useSession as jest.Mock).mockReturnValue({ 
      session: { user: { id: 'user-123' } } 
    });
    
    renderHook(() => useShareHandler());
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/modals/add-link?url=https%3A%2F%2Ftiktok.com')
      );
    });
  });
});

