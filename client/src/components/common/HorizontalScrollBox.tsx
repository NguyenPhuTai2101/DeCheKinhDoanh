import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  arrowClassName?: string;
}

export const HorizontalScrollBox: React.FC<HorizontalScrollBoxProps> = ({
  children,
  className = '',
  showArrows = false,
  arrowClassName = '',
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Kéo chuột để cuộn (Mouse drag-to-scroll trên Desktop)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const initialScrollLeft = useRef(0);
  const hasMoved = useRef(false);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  // Hỗ trợ con lăn chuột (Mouse Wheel Delta Y -> Scroll X)
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && containerRef.current) {
      containerRef.current.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - el.offsetLeft;
    initialScrollLeft.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !containerRef.current) return;
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMoved.current = true;
    }
    containerRef.current.scrollLeft = initialScrollLeft.current - walk;
    checkScroll();
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const scrollByAmount = (amount: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 250);
    }
  };

  return (
    <div className="relative w-full group/scroll">
      {/* Nút mũi tên Cuộn Trái nếu cần */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-180)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/95 shadow-md border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-[#FFD6E5] active:scale-90 transition-all ${arrowClassName}`}
          aria-label="Cuộn trái"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Container cuộn chính */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onScroll={checkScroll}
        className={`scroll-x-touch cursor-grab active:cursor-grabbing ${className}`}
        {...props}
      >
        {children}
      </div>

      {/* Nút mũi tên Cuộn Phải nếu cần */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(180)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white/95 shadow-md border border-[#FFD6E5] flex items-center justify-center text-[#7C5C55] hover:bg-[#FFD6E5] active:scale-90 transition-all ${arrowClassName}`}
          aria-label="Cuộn phải"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
