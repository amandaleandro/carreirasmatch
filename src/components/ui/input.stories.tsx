import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input, Textarea } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Cargo desejado", placeholder: "Ex: Analista Financeiro" },
  render: (args) => (
    <div className="w-72">
      <Input {...args} />
    </div>
  ),
};

export const ComErro: Story = {
  args: {
    label: "Link da vaga",
    placeholder: "https://...",
    error: "Cole um link válido de vaga.",
  },
  render: (args) => (
    <div className="w-72">
      <Input {...args} />
    </div>
  ),
};

export const ComAjuda: Story = {
  args: {
    label: "E-mail",
    placeholder: "voce@email.com",
    helperText: "Usamos só para enviar o resultado da análise.",
  },
  render: (args) => (
    <div className="w-72">
      <Input {...args} />
    </div>
  ),
};

export const Desabilitado: Story = {
  args: { label: "Cargo desejado", value: "Analista Financeiro", disabled: true },
  render: (args) => (
    <div className="w-72">
      <Input {...args} />
    </div>
  ),
};

export const AreaDeTexto: Story = {
  render: () => (
    <div className="w-80">
      <Textarea label="Requisitos / Descrição da vaga" placeholder="Cole os requisitos da vaga aqui..." rows={4} />
    </div>
  ),
};
