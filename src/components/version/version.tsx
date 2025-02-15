import { Squirrel } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { getVersion } from "@/lib/version/version";
import { useEffect, useState } from "react";
import { checkAppUpdate, relaunchApp, updateApp } from "@/lib/version/updater";

export default function Version() {
  const [hasUpdate, setHasUpdate] = useState<boolean>(false);
  const [version, setVersion] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function prepareUpdater() {
      const appUpdateStatus = await checkAppUpdate();
      setHasUpdate(appUpdateStatus);
      const fullVersion = await getVersion();
      setVersion(fullVersion);
    }
    prepareUpdater();
  }, []);

  async function prepareToast() {
    toast({
      title: hasUpdate ? "There's an update available" : "You're up to date!",
      description: `Version: ${version}`,
      action: hasUpdate ? (
        <ToastAction altText='update' onClick={() => updateToLatestApp()}>
          Update
        </ToastAction>
      ) : (
        <></>
      ),
    });
  }

  async function updateToLatestApp() {
    await updateApp();
    await relaunchApp();
  }

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
