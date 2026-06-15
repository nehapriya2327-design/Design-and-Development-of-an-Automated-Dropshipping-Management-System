'use client';

import { Button } from "@/components/ui/button";
import { RotateCw } from 'lucide-react';

export default function LoaderButton() {


  return (
    <Button className="loader-btn bg-primary cursor-pointer text-primary-foreground round">      
        <RotateCw/>
    </Button>
  );
}
