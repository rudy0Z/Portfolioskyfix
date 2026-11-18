import sys
sys.path.insert(0, r"D:\Portfolioskyfix\tools")
from safepatch import apply

PATH = r"D:\Portfolioskyfix\src\App.tsx"

apply(PATH, [
    (
        'import { ExcavationCraterFooter } from "@/sections/ExcavationCraterFooter";',
        'import { SiteFooter } from "@/sections/SiteFooter";\n'
        'import { IntroVeil } from "@/components/IntroVeil";\n'
        'import { useReveal } from "@/lib/useReveal";',
    ),
    (
        '''function PortfolioContent() {
  const { path } = useRoute();
  const [variant] = useState<SkyVariant>("volumetric");
  const [clockSize, setClockSize] = useState<"thumbnail" | "full">("thumbnail");
''',
        '''function PortfolioContent() {
  const { path } = useRoute();
  const [variant] = useState<SkyVariant>("volumetric");
  const [clockSize, setClockSize] = useState<"thumbnail" | "full">("thumbnail");

  // Scroll-reveal engine — one class toggle per element, CSS carries motion.
  useReveal(path);
''',
    ),
    (
        '''    <>
      {/* ── Persistent Raymarched / Halftone Sky Engine ──────────────── */}
      <div className="sky-fixed">
        <CodedSky variant={variant} />
      </div>''',
        '''    <>
      {/* ── Intro veil: brief typographic curtain while the sky bakes ── */}
      <IntroVeil />

      {/* ── Persistent Raymarched / Halftone Sky Engine ──────────────── */}
      <div className="sky-fixed">
        <CodedSky variant={variant} />
      </div>''',
    ),
])

apply(PATH, [("<ExcavationCraterFooter />", "<SiteFooter />")], count=8)
