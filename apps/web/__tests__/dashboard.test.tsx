import { render,screen } from '@testing-library/react';
import { describe,expect,it } from 'vitest';
import { StatusDashboard } from '../src/components/status-dashboard';
describe('StatusDashboard',()=>{it('avisa quando a fonte está indisponível',()=>{render(<StatusDashboard initialData={{data:[],meta:{lastSuccessfulCollection:null,provider:'mock',sourceState:'error'}}}/>);expect(screen.getByRole('alert')).toHaveTextContent(/fonte de dados está indisponível/i);});});
