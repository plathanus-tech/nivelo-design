import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: { name: 'Maria Oliveira' },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Avatar name="Maria Oliveira" size="sm" />
      <Avatar name="Maria Oliveira" size="md" />
      <Avatar name="Maria Oliveira" size="lg" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Avatar name="Ana" color="brand" />
      <Avatar name="Bruno" color="green" />
      <Avatar name="Carla" color="orange" />
      <Avatar name="Diego" color="violet" />
      <Avatar name="Elis" color="pink" />
      <Avatar name="Fábio" color="indigo" />
    </div>
  ),
};

export const SingleName: Story = {
  args: { name: 'Roberto' },
};

export const WithImage: Story = {
  args: { name: 'Maria Oliveira', src: 'https://i.pravatar.cc/80?img=5' },
};
