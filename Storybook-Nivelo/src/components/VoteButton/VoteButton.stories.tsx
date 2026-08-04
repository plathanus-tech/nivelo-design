import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { VoteButton } from './VoteButton';

const meta: Meta<typeof VoteButton> = {
  title: 'Components/VoteButton',
  component: VoteButton,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof VoteButton>;

export const Default: Story = {
  args: { count: 128, voted: false },
};

export const Voted: Story = {
  args: { count: 129, voted: true },
};

export const Small: Story = {
  args: { count: 42, voted: false, size: 'sm' },
};

export const SmallVoted: Story = {
  args: { count: 43, voted: true, size: 'sm' },
};

export const HighCount: Story = {
  args: { count: 2483, voted: false },
};

export const Interactive: Story = {
  render: () => {
    const [voted, setVoted] = useState(false);
    const [count, setCount] = useState(128);
    return (
      <VoteButton
        count={count}
        voted={voted}
        onClick={() => {
          setVoted((v) => !v);
          setCount((c) => (voted ? c - 1 : c + 1));
        }}
      />
    );
  },
};

export const InCardContext: Story = {
  render: () => {
    const [voted, setVoted] = useState(false);
    const [count, setCount] = useState(87);
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', maxWidth: 420, padding: 16, border: '1px solid #E5E5E5', borderRadius: 8 }}>
        <VoteButton
          size="sm"
          count={count}
          voted={voted}
          onClick={() => {
            setVoted((v) => !v);
            setCount((c) => (voted ? c - 1 : c + 1));
          }}
        />
        <div>
          <strong>Adicionar filtro de safra no Caderno de Campo</strong>
          <p style={{ margin: '4px 0 0', color: '#525252', fontSize: 14 }}>
            Seria útil filtrar as anotações por safra ao revisar o histórico de um talhão.
          </p>
        </div>
      </div>
    );
  },
};
