import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Image from "next/image";

interface GridProps {
  grid: "3x3" | "4x4" | "5x5";
  onGridChange: (value: "3x3" | "4x4" | "5x5") => void;
}

export default function Grid({ grid, onGridChange }: GridProps) {
  return (
    <div className='fixed bottom-0 right-0 mb-[20px] mr-[80px] flex items-center justify-center w-max h-[40px] p-1 bg-[rgba(228,228,228,0.7)] z-10 rounded-md shadow-lg backdrop-blur-sm'>
      <ToggleGroup
        type='single'
        value={grid}
        onValueChange={(value) => onGridChange(value as "3x3" | "4x4" | "5x5")}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <ToggleGroupItem value='3x3' asChild>
                <Image
                  src='icon_3x3.svg'
                  alt='3x3'
                  width={10}
                  height={10}
                  draggable={false}
                />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>3x3</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <ToggleGroupItem value='4x4' asChild>
                <Image
                  src='icon_4x4.svg'
                  alt='4x4'
                  width={10}
                  height={10}
                  draggable={false}
                />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>4x4</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <ToggleGroupItem value='5x5' asChild>
                <Image
                  src='icon_5x5.svg'
                  alt='5x5'
                  width={10}
                  height={10}
                  draggable={false}
                />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>5x5</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToggleGroup>
    </div>
  );
}
