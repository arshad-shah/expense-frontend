export interface WidgetType {
  id: string;

  type: "spending" | "budget" | "categories" | "transactions";

  span: 1 | 2 | 3;

  minSpan?: 1 | 2;

  maxSpan?: 1 | 2 | 3;
}
