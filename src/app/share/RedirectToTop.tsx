'use client';

import { useEffect } from 'react';

export default function RedirectToTop() {
  useEffect(() => {
    window.location.replace('/');
  }, []);

  return null;
}
