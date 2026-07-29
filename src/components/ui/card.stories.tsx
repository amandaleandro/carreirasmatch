import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "glass", "subtle", "interactive"] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "default", children: null },
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>Compatibilidade com a vaga</CardTitle>
        <CardDescription>Aderência ao cargo de Desenvolvedor Front-end.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-blue-600">84%</p>
      </CardContent>
    </Card>
  ),
};

export const Interativo: Story = {
  args: { variant: "interactive", children: null },
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <Badge variant="success" dot>
          Match alto
        </Badge>
        <CardTitle className="mt-2">Analista Financeiro</CardTitle>
        <CardDescription>Sua experiência com planejamento orçamentário é um destaque.</CardDescription>
      </CardHeader>
      <CardFooter>
        <span className="text-xs text-slate-500">Analisado há 2 dias</span>
        <Button size="sm" variant="outline">
          Ver detalhes
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Analisando: Story = {
  args: { variant: "subtle", children: null },
  render: (args) => (
    <Card {...args} className="w-80">
      <CardContent>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-xs font-semibold text-slate-600">Analisando seu currículo...</p>
        </div>
      </CardContent>
    </Card>
  ),
};

export const Glass: Story = {
  args: { variant: "glass", children: null },
  render: (args) => (
    <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8">
      <Card {...args} className="w-72">
        <CardContent>
          <p className="text-sm font-semibold">Card com efeito glass sobre fundo colorido</p>
        </CardContent>
      </Card>
    </div>
  ),
};
