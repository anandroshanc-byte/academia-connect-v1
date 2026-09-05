"use client";
export default function HeroMatchVisual(){
 const skills=[['Python',86],['Machine Learning',78],['Research Methods',63],['PyTorch',42]];
 return <div className="bp-visual" aria-label="Illustration of Academia Connect skill intelligence">
   <div className="bp-intel-panel">
    <div className="bp-intel-top"><div><div className="bp-intel-kicker">Capability profile</div><div className="bp-intel-title">AYUSH Research · AI/ML</div></div><div className="bp-readiness">78%</div></div>
    <div className="bp-skill-list">{skills.map(([name,val])=><div className="bp-skill-row" key={name}><span>{name}</span><div className="bp-meter"><i style={{width:`${val}%`}}/></div><b>{val}%</b></div>)}</div>
    <div className="bp-gap-box"><header><span>Priority gap</span><strong>PyTorch · 23 points</strong></header><p className="text-sm text-white/75 mt-2">Recommended: complete a model-training project, then reassess.</p></div>
    <div className="bp-flow"><span>Assess</span><span className="active">Gap found</span><span>Improve</span><span>Verify</span><span>Match</span></div>
   </div>
 </div>
}
