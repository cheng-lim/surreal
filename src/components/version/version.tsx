import { Squirrel } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";

import { getVersion } from "@/lib/version/version";

async function prepareToast() {
  const version = await getVersion();

  toast({
    title: "Current version",
    description: `${version}`,
  });
}

export default function Version() {
  return (
    <div className='fixed flex items-center justify-center bottom-0 right-0 mb-[20px] mr-[30px] z-10  w-[40px] h-[40px] bg-[rgba(228,228,228,0.7)] p-1 rounded-md shadow-lg backdrop-blur-sm'>
      <ToggleGroup type='single' defaultValue='version'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <ToggleGroupItem
                value='version'
                asChild
                className='focus:outline-none focus:ring-0'
                onClick={() => prepareToast()}
              >
                <Squirrel />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>
              <p>Version</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToggleGroup>
    </div>
  );
}
