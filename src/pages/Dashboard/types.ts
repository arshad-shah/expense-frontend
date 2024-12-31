export interface WidgetType {
  id: string;
  type: "spending" | "budget" | "categories" | "transactions";
  spans: {
    mobile: SpanConstraints;
    tablet: SpanConstraints;
    desktop: SpanConstraints;
  };
  title: string;
}

interface SpanConstraints {
  min: number;
  max: number;
  default: number;
}
