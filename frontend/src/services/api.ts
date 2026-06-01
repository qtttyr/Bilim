import { Material } from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'ok';
  } catch (err) {
    console.error('Server health check failed', err);
    return false;
  }
}

export async function scrapeUrlText(url: string): Promise<string> {
  const response = await fetch(`${API_BASE}/scrape`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to scrape URL text content.');
  }

  const data = await response.json();
  return data.text;
}

export async function ingestMaterial(
  title: string,
  rawContent: string,
  sourceType: 'file' | 'text' | 'url',
  file?: File
): Promise<Material> {
  const formData = new FormData();
  formData.append('title', title);

  if (sourceType === 'file' && file) {
    formData.append('file', file);
  } else {
    formData.append('text', rawContent);
  }

  const response = await fetch(`${API_BASE}/ingest`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to process and ingest study material.');
  }

  const data = await response.json();
  return data as Material;
}
