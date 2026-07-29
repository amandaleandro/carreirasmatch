import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "danger", "brand", "outline"],
    },
    size: { control: "select", options: ["sm", "md"] },
  },
  args: { children: "Match alto" },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
export const MatchAlto: Story = { args: { variant: "success", children: "89% de match", dot: true } };
export const MatchMedio: Story = { args: { variant: "warning", children: "61% de match", dot: true } };
export const MatchBaixo: Story = { args: { variant: "danger", children: "32% de match", dot: true } };
export const Marca: Story = { args: { variant: "brand", children: "Novo" } };
export const Outline: Story = { args: { variant: "outline" } };
