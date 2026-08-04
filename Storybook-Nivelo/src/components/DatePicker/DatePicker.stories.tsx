import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker, DateRangeValue } from './DatePicker';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  decorators: [(S) => <div style={{ width: 280, paddingBottom: 320 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Single: Story = {
  render: () => {
    const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });
    return <DatePicker mode="single" value={value} onChange={setValue} label="Data prevista de entrega" placeholder="Selecionar data" />;
  },
};

export const Range: Story = {
  render: () => {
    const [value, setValue] = useState<DateRangeValue>({ start: null, end: null });
    return <DatePicker mode="range" value={value} onChange={setValue} label="Período" placeholder="Selecionar período" />;
  },
};
