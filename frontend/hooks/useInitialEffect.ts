'use client';
import { useEffect, useRef, type DependencyList } from 'react';
export function useInitialEffect(effect: () => unknown, _dependencies?: DependencyList) {
  const initialEffect = useRef(effect);
  useEffect(() => { void initialEffect.current(); }, []);
}
