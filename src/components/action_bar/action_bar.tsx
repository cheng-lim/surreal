import Grid from "./grid";

export enum ActionType {
  Grid,
}

interface ActionBarProps {
  actionType: ActionType;
  grid?: "3x3" | "4x4" | "5x5";
  onGridChange?: (value: "3x3" | "4x4" | "5x5") => void;
}

export default function ActionBar({
  actionType,
  grid,
  onGridChange,
}: ActionBarProps) {
  if (actionType === ActionType.Grid && grid && onGridChange) {
    return <Grid grid={grid} onGridChange={onGridChange} />;
  }
  return <></>;
}
