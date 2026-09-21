import { MdPrecisionManufacturing, MdLocationOn, MdArrowForward } from 'react-icons/md';
import Image from 'next/image';
import { Button } from '@/shared/components/ui/Button';

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-background pb-space-3xl pt-space-2xl border-b border-border/40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[140px]"></div>
      
      <div className="relative mx-auto max-w-360 px-margin-mobile lg:px-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter-desktop lg:grid-cols-12 lg:items-center">
          
          <div className="flex flex-col gap-space-lg lg:col-span-7">
            <div className="inline-flex w-fit items-center gap-space-xs rounded-full bg-card border border-border px-space-md py-space-2xs shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <span className="font-label-spec text-label-spec uppercase tracking-wider text-primary font-semibold">
                Over 840 Active Factory Floor Openings Today
              </span>
            </div>
            
            <div className="flex flex-col gap-space-xs">
              <h1 className="font-headline-lg text-headline-lg lg:font-display-hero lg:text-display-hero tracking-tight text-foreground">
                The premier job board for skilled factory operators and technical trades.
              </h1>
              <p className="font-body-lg text-body-lg text-muted-foreground max-w-xl">
                Direct placement for CNC operators, maintenance technicians, and precision machinists across production lines and local manufacturing plants.
              </p>
            </div>
            
            <div className="mt-space-xs rounded-lg bg-card p-space-xs shadow-2xl border border-border">
              <div className="flex flex-col md:flex-row md:items-center gap-space-xs">
                <div className="flex flex-1 items-center gap-space-xs rounded-md bg-input border border-border/60 px-space-md py-space-sm focus-within:border-primary transition-colors">
                  <MdPrecisionManufacturing className="text-primary text-[20px]" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="font-label-spec text-label-spec text-muted-foreground uppercase">Role or Machinery Spec</label>
                    <input className="bg-transparent font-body-md text-body-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none w-full" id="search-query" placeholder="e.g. 5-Axis Mill, DMG MORI, Haas CNC, Lathe" type="text"/>
                  </div>
                </div>
                <div className="flex flex-1 items-center gap-space-xs rounded-md bg-input border border-border/60 px-space-md py-space-sm focus-within:border-primary transition-colors">
                  <MdLocationOn className="text-primary text-[20px]" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <label className="font-label-spec text-label-spec text-muted-foreground uppercase">Plant Location or Zone</label>
                    <input className="bg-transparent font-body-md text-body-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none w-full" id="search-location" placeholder="e.g. Detroit, MI, Stuttgart, DE, Bilbao" type="text"/>
                  </div>
                </div>
                <Button 
                  className="px-space-xl py-space-md shadow-md shadow-sky-950/40 active:translate-y-0.5" 
                  id="search-btn"
                  rightIcon={<MdArrowForward className="text-[18px]" />}
                >
                  <span className="font-label-technical text-label-technical tracking-wider uppercase font-semibold">Search Openings</span>
                </Button>
              </div>
            </div>
            
          </div>
          
          <div className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-xl bg-card  shadow-foreground/20 shadow-md">
              <div className="relative h-96 w-full">

                <Image 
                  alt="A modern advanced industrial manufacturing facility interior" 
                  className="object-cover shadow-lg shadow-amber-950/40" 
                  src="/sqr_img_39.jpg" 
                  fill
                  sizes='500px'
                  priority
                />

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
