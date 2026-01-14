export interface DecisionMatrix {
  decision: {
    statement: string;
    description: string;
  };
  options: Array<{
    label: string;
    description: string;
  }>;
  criteria: Array<{
    name: string;
    cells: Record<
      string,
      {
        text: string;
        color?: "red" | "yellow" | "green";
      }
    >;
  }>;
}
