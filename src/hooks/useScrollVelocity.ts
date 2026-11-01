"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useScrollVelocity - High-performance scroll velocity tracker
 * Returns current scroll position, direction, and instantaneous velocity
 * Optimized for React 19 with rAF-based sampling
 */
export interface ScrollVelocityState {
  /** Current vertical scroll position in pixels */
  scrollTop: number;
  /** Instantaneous scroll velocity in pixels per millisecond */
  velocity: number;
  /** Direction: 1 = down, -1 = up, 0 = stopped */
  direction: number;
  /** Smoothed velocity (decaying) for thruster/flame effects */
  smoothedVelocity: number;
}

export function useScrollVelocity(
  deps: React.DependencyList = []
): ScrollVelocityState {
  const stateRef = useRef({
    lastTime: performance.now(),
    lastPosition: window.scrollY,
    velocity: 0 as number,
    smoothedVelocity: 0 as number,
  });

  const [state, setState] = useState<ScrollVelocityState>({
    scrollTop: window.scrollY,
    velocity: 0,
    direction: 0,
    smoothedVelocity: 0,
  });

  useEffect(() => {
    if (typeof requestAnimationFrame === "undefined") return;

    let rafId: number;

    const tick = () => {
      const now = performance.now();
      const dt = Math.max(1, now - stateRef.current.lastTime); // Prevent zero divide
      
      const currentPosition = window.scrollY;
      const deltaPosition = currentPosition - stateRef.current.lastPosition;
      
      // Instantaneous velocity (px/ms)
      const instantVelocity = deltaPosition / dt;
      
      // Exponential smoothing for smoother thruster response
      const decay = 0.85;
      const smoothedVel = 
        stateRef.current.smoothedVelocity * decay + instantVelocity * (1 - decay);
      
      // Update ref
      stateRef.current = {
        lastTime: now,
        lastPosition: currentPosition,
        velocity: instantVelocity,
        smoothedVelocity: smoothedVel,
      };

      // Throttle React state updates to ~30fps
      if (Math.abs(instantVelocity) > 0.01 || Math.abs(smoothedVel) > 0.01) {
        setState({
          scrollTop: currentPosition,
          velocity: instantVelocity,
          direction: instantVelocity > 0.01 ? 1 : instantVelocity < -0.01 ? -1 : 0,
          smoothedVelocity: smoothedVel,
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, deps);

  return state;
}

/**
 * useViewportScrollVelocity - Same as above but only when element is in view
 * Combines IntersectionObserver with scroll velocity tracking
 */
export function useViewportScrollVelocity(
  ref: React.RefObject<Element>,
  enabled: boolean = true
): ScrollVelocityState {
  const [isVisible, setIsVisible] = useState(false);
  const velocityState = useScrollVelocity([isVisible]);

  useEffect(() => {
    if (!enabled || !ref.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: [0.1] }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, ref]);

  // Return zero velocity when not visible (prevents thrusters firing off-screen)
  return isVisible 
    ? velocityState 
    : { ...velocityState, velocity: 0, smoothedVelocity: 0 };
}

export default useScrollVelocity;
