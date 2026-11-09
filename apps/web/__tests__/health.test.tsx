import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HealthPage from '../app/health/page';
describe('HealthPage', () => {
  afterEach(() => vi.restoreAllMocks());
  it('exibe indisponibilidade quando a API falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<HealthPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('API indisponível');
  });
  it('exibe o estado retornado pela API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status:'ok', database:'connected', redis:'connected' }) }));
    render(<HealthPage />);
    expect(await screen.findByText('Operacional')).toBeInTheDocument();
  });
});
