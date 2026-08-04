import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Chip, ChipRow } from './Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: { children: 'Financeiro', selected: false },
};

export const Selected: Story = {
  args: { children: 'Financeiro', selected: true },
};

const CATEGORIES = ['Todas', 'Financeiro', 'Estoque', 'Caderno de campo', 'Relatórios', 'Assistente de IA', 'Outros'];

export const RowInteractive: Story = {
  render: () => {
    const [active, setActive] = useState('Todas');
    return (
      <ChipRow>
        {CATEGORIES.map((c) => (
          <Chip key={c} selected={active === c} onClick={() => setActive(c)}>
            {c}
          </Chip>
        ))}
      </ChipRow>
    );
  },
};

export const NarrowContainer: Story = {
  render: () => {
    const [active, setActive] = useState('Todas');
    return (
      <div style={{ width: 320, border: '1px dashed #ccc', padding: 8 }}>
        <ChipRow>
          {CATEGORIES.map((c) => (
            <Chip key={c} selected={active === c} onClick={() => setActive(c)}>
              {c}
            </Chip>
          ))}
        </ChipRow>
      </div>
    );
  },
};
