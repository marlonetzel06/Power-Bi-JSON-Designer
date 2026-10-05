import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAuthStore } from './authStore';
import { useLiveAvailability } from './useLiveAvailability';

describe('useLiveAvailability', () => {
  it('explains why live is unavailable and when it is available', () => {
    useAuthStore.setState({ status: 'unconfigured', pages: [] });
    expect(renderHook(() => useLiveAvailability('barChart')).result.current).toEqual({ available: false, reason: 'unconfigured' });
    useAuthStore.setState({ status: 'signed-out' });
    expect(renderHook(() => useLiveAvailability('barChart')).result.current).toEqual({ available: false, reason: 'signed-out' });
    useAuthStore.setState({ status: 'ready', pages: [{ name: 'p', displayName: 'Stacked Bar chart', visualTypes: ['barChart'] }] });
    expect(renderHook(() => useLiveAvailability('barChart')).result.current).toEqual({ available: true });
    expect(renderHook(() => useLiveAvailability('kpi')).result.current).toEqual({ available: false, reason: 'no-page' });
  });
});
