import Image from 'next/image';

type OrbitEmblemProps = {
  textureUrl: string | null;
};

const planetClasses = 'absolute left-1/2 -translate-x-1/2 rounded-full bg-current shadow-planet';

export function OrbitEmblem({ textureUrl }: OrbitEmblemProps) {
  return (
    <div aria-hidden="true" className="relative size-24 shrink-0">
      <div className="animate-orbit-outer absolute inset-0 rounded-full border border-dashed border-white/13">
        <span className={`${planetClasses} top-0 size-1.75 -translate-y-1/2 text-nebula-300`} />
      </div>
      <div className="animate-orbit-inner absolute inset-0 m-auto size-16.5 rounded-full border border-white/13">
        <span className={`${planetClasses} bottom-0 size-1.25 translate-y-1/2 text-ember-400`} />
      </div>
      <div className="absolute inset-0 m-auto size-9 overflow-hidden rounded-full bg-[radial-gradient(circle_at_38%_36%,var(--color-emblem-light),var(--color-emblem-mid)_60%,var(--color-emblem-dark))] shadow-emblem">
        {textureUrl && <Image src={textureUrl} alt="" fill sizes="72px" className="object-cover" />}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_38%_36%,transparent_40%,var(--color-emblem-dark))] opacity-70" />
      </div>
    </div>
  );
}
