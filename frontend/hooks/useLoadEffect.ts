'use client';
import { useEffect, type DependencyList } from 'react';
export function useLoadEffect(effect: () => unknown, dependencies: DependencyList) {
  useEffect(() => { void effect(); }, dependencies);
}
