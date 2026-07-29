import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger", "glass", "whatsapp"],
    },
    size: { control: "select", options: ["sm", "md", "lg", "icon"] },
  },
  args: { onClick: fn(), children: "Calcular meu Match grátis" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Principal: Story = { args: { variant: "primary" } };
export const Secundario: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Perigo: Story = { args: { variant: "danger", children: "Excluir conta" } };
export const WhatsApp: Story = { args: { variant: "whatsapp", children: "Falar no WhatsApp" } };
export const Carregando: Story = { args: { variant: "primary", isLoading: true, children: "Calculando Match..." } };
export const Desabilitado: Story = { args: { variant: "primary", disabled: true } };
export const Pequeno: Story = { args: { variant: "primary", size: "sm" } };
export const Grande: Story = { args: { variant: "primary", size: "lg" } };
