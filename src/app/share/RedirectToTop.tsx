'use client';

import { useEffect } from 'react';

export default function RedirectToTop() {
  useEffect(() => {
    const source = window.location.pathname.includes('allclear') ? 'allclear' : 'clear';
    window.location.replace(`/?fromShare=${source}`);
  }, []);

  return null;
}
