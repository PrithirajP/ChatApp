function BorderAnimatedContainer({ children }) {
  return (
    <div className="
      relative flex h-full w-full overflow-hidden rounded-2xl border border-transparent 
      animate-border
      [background:linear-gradient(45deg,#172033,var(--color-slate-800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),#4755697a_80%,_var(--color-cyan-500)_86%,_var(--color-cyan-300)_90%,_var(--color-cyan-500)_94%,_#4755697a)_border-box]
    ">
      {children}
    </div>
  );
}

export default BorderAnimatedContainer;