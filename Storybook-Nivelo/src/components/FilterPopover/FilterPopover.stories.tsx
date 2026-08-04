import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterPopover } from './FilterPopover';
import { Dropdown } from '../Dropdown/Dropdown';

const meta: Meta<typeof FilterPopover> = {
  title: 'Components/FilterPopover',
  component: FilterPopover,
  tags: ['autodocs'],
  decorators: [(S) => <div style={{ paddingBottom: 240 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof FilterPopover>;

export const Default: Story = {
  render: () => {
    const [situacao, setSituacao] = useState('todas');
    const [destinatario, setDestinatario] = useState('todos');
    const [applied, setApplied] = useState({ situacao: 'todas', destinatario: 'todos' });

    return (
      <FilterPopover
        label="Filtros"
        fields={
          <>
            <Dropdown
              label="Situação"
              value={situacao}
              onChange={setSituacao}
              options={[
                { label: 'Todas', value: 'todas' },
                { label: 'Pendente', value: 'pendente' },
                { label: 'Quitado', value: 'quitado' },
              ]}
            />
            <Dropdown
              label="Destinatário"
              value={destinatario}
              onChange={setDestinatario}
              options={[
                { label: 'Todos', value: 'todos' },
                { label: 'Cooperativa Central', value: 'Cooperativa Central' },
                { label: 'Agroindústria Sul', value: 'Agroindústria Sul' },
              ]}
            />
          </>
        }
        onApply={() => setApplied({ situacao, destinatario })}
        onClear={() => {
          setSituacao('todas');
          setDestinatario('todos');
          setApplied({ situacao: 'todas', destinatario: 'todos' });
        }}
      />
    );
  },
};
