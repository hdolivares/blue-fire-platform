import { IconDrop, IconFlame, IconSnow } from "./assets";

const ITEMS: Array<{ label: string; icon: "drop" | "snow" | "flame" }> = [
  { label: "Pure water", icon: "drop" },
  { label: "Cool air", icon: "snow" },
  { label: "Hot water", icon: "flame" },
  { label: "No wells", icon: "drop" },
  { label: "No trucks", icon: "snow" },
  { label: "No plastic miles", icon: "flame" },
];

function Icon({ kind }: { kind: "drop" | "snow" | "flame" }) {
  if (kind === "drop") return <IconDrop />;
  if (kind === "snow") return <IconSnow />;
  return <IconFlame className="alt" />;
}

function Track({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="bf-marquee-track" aria-hidden={hidden || undefined}>
      {[...ITEMS, ...ITEMS].map((item, i) => (
        <span className="bf-marquee-item" key={`${item.label}-${i}`}>
          <Icon kind={item.icon} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="bf-marquee" role="presentation">
      <Track />
      <Track hidden />
    </div>
  );
}
