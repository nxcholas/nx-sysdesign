import { Header } from '@/components/features/header/header';
import { SidePanel } from '@/components/features/side-panel/side-panel';
import { CanvasRoot } from '@/components/features/canvas/canvas-root';

export default function Page() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SidePanel />
        <CanvasRoot />
      </div>
    </div>
  );
}
