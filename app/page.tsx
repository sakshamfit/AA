"use client";
import {useEffect,useRef,useState} from "react";
import Lenis from "lenis";
import {ArrowUpRight,ArrowDown,Menu} from "lucide-react";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import Sculpture from "./sculpture";
import FilmLoop from "./film-loop";
import SoundBridge from "./sound-bridge";
import {DURATION,clamp,range,windowFade,motionState,smooth} from "./motion";
const signature="M63 257 145 49 156 254 42 164H323 M179 257 242 49 283 257";
function Signature({className=""}:{className?:string}){return <svg className={className} viewBox="25 25 320 260" role="img" aria-label="Allu Arjun AA signature"><path d={signature} stroke="currentColor" strokeWidth="7" strokeLinejoin="miter" fill="none"/></svg>}
const films=[
 {title:"RAAKA",sub:"ALLU ARJUN × ATLEE",tag:"UPCOMING / SUN PICTURES",image:"/images/raaka-firstlook.jpg",video:"SI_PhNII7Mc",loop:"/videos/raaka-loop.mp4",position:"50% 29%",poster:false},
 {title:"PUSHPA 2",sub:"THE RULE",tag:"2024 / A SUKUMAR FILM",image:"/images/pushpa-poster-red.jpg",video:"g3JUbgOHgdw",loop:"/videos/pushpa-regal.mp4",position:"50% 50%",poster:false},
 {title:"DJ",sub:"DUVVADA JAGANNADHAM",tag:"2017 / A HARISH SHANKAR FILM",image:"/images/dj-alternate.jpg",video:"fy-kooz9se4",loop:"/videos/dj-hd-loop.mp4",position:"50% 50%",poster:false},
 {title:"SARRAINODU",sub:"ALLU ARJUN AS GANA",tag:"2016 / A BOYAPATI SREENU FILM",image:"/images/sarrainodu-poster.jpg",video:"SquY-O70Feo",loop:"/videos/sarrainodu-hd-loop.mp4",position:"50% 50%",poster:false},
 {title:"ALA VAIKUNTHAPURRAMULOO",sub:"ALLU ARJUN × TRIVIKRAM",tag:"2020 / GEETHA ARTS · HAARIKA & HASSINE",image:"/images/ala-vaikunthapurramuloo-poster.jpg",video:"ct_j7wgzwyM",loop:"/videos/ala-vaikunthapurramuloo-hd-loop.mp4",position:"50% 50%",poster:true},
 {title:"RACE GURRAM",sub:"ALLU ARJUN AS LUCKY",tag:"2014 / A SURENDER REDDY FILM",image:"/images/race-gurram-poster.jpg",video:"MdrXJHZSm8Y",loop:"/videos/race-gurram-hd-loop.mp4",position:"50% 50%",poster:true},
];
const spotlights=[
 {...films[2],studio:"SRI VENKATESWARA CREATIONS",description:"Allu Arjun brings two sides of Duvvada Jagannadham to life in Harish Shankar’s action entertainer."},
 {...films[3],studio:"GEETHA ARTS",description:"Allu Arjun as Gana. Boyapati Sreenu’s Sarrainodu brings together action, attitude and the music of Thaman S."},
];
const nav=[{s:0,label:"The beginning"},{s:1.15,label:"Films"},{s:4.45,label:"The icon"},{s:7.7,label:"In focus"},{s:12.8,label:"Signature"}];
export default function Home(){
 const root=useRef<HTMLDivElement>(null),lenis=useRef<Lenis|null>(null);const[menu,setMenu]=useState(false),[ready,setReady]=useState(false),[finish,setFinish]=useState("iridescent"),[active,setActive]=useState(0),[videoScene,setVideoScene]=useState({orbit:-2,feature:0,portrait:false,orbitLoad:0,orbitPlay:0});
 useEffect(()=>{const el=root.current!;const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;motionState.reduced=reduced;motionState.material="iridescent";let scroller:Lenis|null=null;
 const touchLayout=matchMedia("(max-width: 900px), (pointer: coarse)");
 const configureScroll=()=>{scroller?.destroy();scroller=touchLayout.matches?null:new Lenis({lerp:.12,smoothWheel:!reduced,autoRaf:false});lenis.current=scroller;if(touchLayout.matches){motionState.pointerX=0;motionState.pointerY=0;}};
 configureScroll();touchLayout.addEventListener("change",configureScroll);
 let viewportWidth=innerWidth,viewportHeight=innerHeight,scrollLimit=1;
 const measure=()=>{viewportWidth=innerWidth;viewportHeight=el.clientHeight;scrollLimit=Math.max(1,document.documentElement.scrollHeight-viewportHeight);};
 measure();window.addEventListener("resize",measure,{passive:true});
 const resizeObserver=new ResizeObserver(measure);resizeObserver.observe(document.querySelector(".scroll-distance")!);
 const get=(s:string)=>el.querySelector<HTMLElement>(s)!;const opening=get(".opening"),openingMark=get(".opening-mark"),workTitle=get(".work-title"),filmStage=get(".film-stage"),filmCards=[...el.querySelectorAll<HTMLElement>(".orbit-card")],filmCaptions=[...el.querySelectorAll<HTMLElement>(".film-caption")],mission=get(".mission"),vision=get(".vision"),light=get(".light-world"),cinema=get(".cinema"),cinemaType=get(".cinema-type"),feature=get(".feature-stage"),featureCards=[...el.querySelectorAll<HTMLElement>(".feature")],portrait=get(".portrait"),finale=get(".finale"),draft=get(".draft-grid"),finalMark=get(".final-mark"),finalName=get(".final-name"),progress=get(".reading-progress"),room=get(".room"),materialControl=get(".material-control"),counter=get(".scene-counter"),atmosphere=get(".atmosphere"),floor=get(".depth-floor");
 const visibility=(node:HTMLElement,alpha:number)=>{node.style.opacity=String(alpha);node.style.visibility=alpha>.002?"visible":"hidden";node.style.pointerEvents=alpha>.45?"auto":"none";node.setAttribute("aria-hidden",alpha>.45?"false":"true");};
 let frame=0,lastChapter=-1,lastVideoScene="",pointerX=0,pointerY=0,lastS=-1,lastWidth=0,lastHeight=0;
 const animate=(time:number)=>{frame=requestAnimationFrame(animate);if(document.hidden)return;scroller?.raf(time);
 const h=viewportHeight,w=viewportWidth,mobile=w<=900,s=clamp(scrollY/scrollLimit)*DURATION;motionState.s=s;
 if(Math.abs(s-lastS)<.00001&&w===lastWidth&&h===lastHeight&&Math.abs(pointerX-motionState.pointerX)<.0005&&Math.abs(pointerY-motionState.pointerY)<.0005)return;
 lastS=s;lastWidth=w;lastHeight=h;
 pointerX+=(motionState.pointerX-pointerX)*.055;pointerY+=(motionState.pointerY-pointerY)*.055;
 progress.style.transform=`scaleX(${s/DURATION})`;visibility(materialControl,1-range(s,mobile?.45:3.7,mobile?.8:4));counter.style.opacity=String(1-range(s,10.9,11.3));
 visibility(opening,1-range(s,.22,.9));openingMark.style.transform=`translate(-50%,-50%) scale(${1+range(s,0,1)*.12})`;
 visibility(workTitle,windowFade(s,.3,3.95,.5));workTitle.style.transform=`translate(-50%,-50%) scale(${1+range(s,.3,4)*.13})`;
 visibility(filmStage,windowFade(s,.8,4.05,.25));const cursor=range(s,.95,3.55)*(films.length-.15)-.3;
 filmCards.forEach((card,i)=>{const d=i-cursor,offset=d*(mobile?w*.94:w*.66),z=55-Math.abs(d)*310,angle=-d*32+pointerX*7,alpha=clamp(2.25-Math.abs(d));card.style.transform=`translate(-50%,-50%) translate3d(${offset}px,${Math.sin(d*.8)*38-pointerY*17}px,${z}px) rotateY(${angle}deg) rotateX(${-pointerY*5}deg) rotateZ(${Math.sin(d*.7)*-4}deg)`;card.style.opacity=String(alpha);card.style.zIndex=String(20-Math.round(Math.abs(d)*3));visibility(filmCaptions[i],i===Math.round(cursor)?1:0);});
 let orbitLoad=0,orbitPlay=0;
 if(s>.3&&s<4.1)films.forEach((_,i)=>{const distance=Math.abs(i-cursor);if(distance<2.4)orbitLoad|=1<<i;if(distance<(mobile?1.25:1.7)&&s>.8&&s<4.05)orbitPlay|=1<<i;});
 const nextVideoScene={orbit:s>.3&&s<4.1?Math.floor(cursor):-2,orbitLoad,orbitPlay,feature:(s>7&&s<8.7?1:0)|(s>8&&s<9.8?2:0),portrait:s>8.85&&s<11.2};const videoKey=`${orbitLoad}:${orbitPlay}:${nextVideoScene.feature}:${nextVideoScene.portrait}`;if(videoKey!==lastVideoScene){lastVideoScene=videoKey;setVideoScene(nextVideoScene);}
 const white=range(s,3.85,4.15)*(1-range(s,6.35,6.8));light.style.clipPath=`inset(${(1-white)*100}% 0 0 0)`;light.style.opacity=String(1-range(s,6.45,6.85));visibility(mission,windowFade(s,4.03,4.85,.25));visibility(vision,windowFade(s,4.62,6.25,.35));vision.style.transform=`scale(${1+range(s,5.85,6.4)*.2})`;
 visibility(cinema,windowFade(s,6.5,7.8,.4));cinemaType.style.transform=`translate(-50%,-50%) translateX(${(range(s,6.5,7.8)-.5)*-35}vw) scale(${1.45-range(s,6.5,7.8)*.55})`;
 visibility(feature,windowFade(s,7.25,9.75,.35));featureCards.forEach((card,i)=>{const p=range(s,7.25+i*1.05,8.35+i*1.05);visibility(card,windowFade(s,7.25+i*1.05,8.65+i*1.05,.3));card.style.transform=`perspective(1400px) translate3d(${(1-smooth(clamp(p*2)))*w*.55-range(p,.7,1)*w*.65}px,0,${-350*(1-smooth(clamp(p*2)))}px) rotateY(${(1-smooth(clamp(p*2)))*-30+range(p,.7,1)*22}deg)`;});
 const pp=range(s,9.15,10.15),exit=range(s,10.4,11.15);visibility(portrait,windowFade(s,9.1,11.2,.3));portrait.style.transform=`perspective(1200px) translate3d(${(1-smooth(pp))*w*.55}px,${-exit*h}px,0) scale(${.35+.65*smooth(pp)}) rotateY(${(1-smooth(pp))*-28}deg)`;
 visibility(finale,range(s,10.65,11.45));draft.style.opacity=String(range(s,11.2,11.8)*(1-range(s,13.2,13.8)));draft.style.transform=`scale(${1.3-range(s,11.2,13.2)*.3})`;
 finalMark.style.opacity=String(range(s,11.95,12.8));finalMark.style.transform=`translateX(${(1-range(s,11.8,12.9))*w*.1}px)`;finalName.style.clipPath=`inset(0 ${(1-range(s,12,13.4))*100}% 0 0)`;finalName.style.opacity=String(range(s,12,12.8));
 const depthAlpha=1-windowFade(s,3.9,6.8,.35);atmosphere.style.opacity=String(depthAlpha*.95);floor.style.opacity=String((windowFade(s,0,4.1,.6)+windowFade(s,6.7,10,.6))*.7);floor.style.transform=`perspective(800px) rotateX(67deg) rotateZ(${-pointerX*5}deg) translateY(${Math.sin(s)*35}px)`;el.style.setProperty("--scene-hue",`${Math.round(s*22)}deg`);
 room.style.opacity=String(windowFade(s,.2,4,.4)+windowFade(s,6.8,9.8,.6));room.style.transform=`perspective(1000px) rotateY(${Math.sin(s)*12+pointerX*6}deg) rotateX(${-pointerY*3}deg) scale(1.12)`;
 document.body.classList.toggle("is-light",s>4.02&&s<6.5);const chapter=s<.8?0:s<4?1:s<6.6?2:s<11?3:4;if(chapter!==lastChapter){setActive(chapter);lastChapter=chapter;}
 };frame=requestAnimationFrame(animate);const timer=setTimeout(()=>setReady(true),900);const pointer=(e:PointerEvent)=>{if(e.pointerType!=="mouse"||touchLayout.matches)return;motionState.pointerX=e.clientX/innerWidth-.5;motionState.pointerY=e.clientY/innerHeight-.5;};window.addEventListener("pointermove",pointer,{passive:true});return()=>{clearTimeout(timer);cancelAnimationFrame(frame);scroller?.destroy();touchLayout.removeEventListener("change",configureScroll);window.removeEventListener("resize",measure);resizeObserver.disconnect();window.removeEventListener("pointermove",pointer);document.body.classList.remove("is-light");};},[]);
 useEffect(()=>{if(menu)lenis.current?.stop();else lenis.current?.start();},[menu]);
 function go(s:number){setMenu(false);lenis.current?.start();const y=s/DURATION*(document.documentElement.scrollHeight-(root.current?.clientHeight??innerHeight));if(lenis.current)lenis.current.scrollTo(y,{duration:1.3});else window.scrollTo({top:y,behavior:motionState.reduced?"instant":"smooth"});}
 return <><div className={`intro ${ready?"done":""}`} aria-hidden="true"><Signature/><span>ALLU ARJUN</span></div><header><a href="#home" className="brand" onClick={e=>{e.preventDefault();go(0);}} aria-label="Allu Arjun home"><Signature/></a><nav aria-label="Main navigation">{nav.slice(1,4).map(n=><button key={n.label} onClick={()=>go(n.s)}>{n.label}</button>)}</nav><div className="header-right"><button className="pill" onClick={()=>go(1.12)}>Latest film <ArrowUpRight size={14}/></button><button aria-label="Open navigation" className="menu" onClick={()=>setMenu(true)}><Menu size={20}/></button></div></header>
 <aside className="rail" aria-label="Scene navigation">{nav.map((n,i)=><button key={n.label} className={active===i?"active":""} onClick={()=>go(n.s)} aria-label={`Go to ${n.label}`}><span>{n.label}</span><i/></button>)}</aside>
 <div className="scroll-distance" id="home" aria-hidden="true"/>
 <main ref={root} className="experience" aria-label="Allu Arjun cinematic experience">
  <div className="reading-progress"/><div className="room" aria-hidden="true"/><div className="atmosphere" aria-hidden="true"><i/><i/><i/></div><div className="depth-floor" aria-hidden="true"/><div className="light-world" aria-hidden="true"/>
  <section className="opening scene"><div className="opening-mark"><Signature/></div><div className="opening-foot"><button onClick={()=>go(1.1)}><ArrowDown size={17}/>SCROLL TO EXPLORE</button><div><h1>ALLU ARJUN</h1><p>A world beyond the frame.</p></div></div></section>
  <div className="work-title" aria-hidden="true">FILMS</div>
  <Sculpture/>
  <section className="film-stage scene" aria-label="Selected films"><div className="orbit">{films.map((f,i)=><article className={`orbit-card ${f.poster?"poster-card":""}`} key={f.title} aria-label={f.title}>{f.poster&&<span className="poster-backdrop" style={{backgroundImage:`url(${f.image})`}} aria-hidden="true"/>}<img src={f.image} alt={f.title==="RAAKA"?"Allu Arjun — RAAKA first look":`Allu Arjun — ${f.title}`} style={{objectPosition:f.position}}/><FilmLoop src={f.loop} title={f.title} active={!menu&&!!(videoScene.orbitPlay&(1<<i))} preload={!!(videoScene.orbitLoad&(1<<i))}/><span className="film-edge" aria-hidden="true"/></article>)}</div>{films.map((f,i)=><div className="film-caption" key={f.title}><span>0{i+1} / 06 <b>{f.tag}</b></span><h2 className={f.title.length>20?"long-film-title":""}>{f.title}</h2><p>{f.sub}</p></div>)}</section>
  <section className="mission scene"><span className="outline-label">THE ICON</span><div className="mission-copy"><p><span>Every character.</span><br/><span>Every movement.</span><br/><span>Unmistakably Allu Arjun.</span></p><small>From Indian cinema to hearts around the world.</small></div></section>
  <section className="vision scene"><span className="outline-label">VISION</span><div className="vision-copy"><p><span>Beyond the screen.</span><br/><span>Beyond the expected.</span></p><small>One signature. Limitless worlds.</small></div><div className="registration-crosses" aria-hidden="true">{Array.from({length:18},(_,i)=><span key={i}>+</span>)}</div></section>
  <section className="cinema scene" aria-label="Cinema without limits"><div className="cinema-type" aria-hidden="true">CINEMA<br/>CINEMA<br/>CINEMA</div></section>
  <section className="feature-stage scene" aria-label="Films in focus">{spotlights.map((f,i)=><article className={`feature feature-${i}`} key={f.title}><div className="feature-art" aria-label={f.title}><img src={f.image} alt={`Allu Arjun in ${f.title}`} style={{objectPosition:f.position}}/><FilmLoop src={f.loop} title={f.title} active={!menu&&!!(videoScene.feature&(1<<i))} preload={!!(videoScene.feature&(1<<i))}/></div><div className="feature-copy"><span>{f.studio}</span><h2>{f.title}</h2><h3>{f.sub}</h3><p>{f.description}</p></div></article>)}</section>
  <section className="portrait scene"><div className="portrait-media"><img src="/images/allu-qbik-1.jpg" alt="Allu Arjun in a black suit"/><FilmLoop src="/videos/allu-portrait-loop.mp4" title="Allu Arjun" active={!menu&&videoScene.portrait} preload={videoScene.portrait}/></div><div className="portrait-title"><Signature/><h2>ALLU ARJUN</h2><p>The man. The moments. The signature.</p></div><div className="portrait-border"/></section>
  <footer className="finale scene"><div className="draft-grid" aria-hidden="true"><svg viewBox="0 0 1440 900" preserveAspectRatio="none">{Array.from({length:24},(_,i)=><path key={i} d={`M${i*65} 0V900 M0 ${i*45}H1440`}/>)}<path d="M85 720 355 140 390 720 80 450H1400 M600 720 785 140 925 720"/></svg></div><div className="final-brand"><Signature className="final-mark"/><div className="final-name">ALLU<br/>ARJUN</div></div><div className="footer-bottom"><div><button onClick={()=>go(0)}>Top</button><button onClick={()=>go(1.1)}>Films</button><button onClick={()=>go(4.5)}>The icon</button></div><a href="https://www.instagram.com/alluarjunonline/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={15}/></a><p>Independent fan tribute.<br/>Imagery and trademarks belong to their respective owners.</p></div></footer>
  <div className="scene-counter" aria-hidden="true">{String(active+1).padStart(2,"0")} — 05</div>
  <div className="material-control"><div className="axis" aria-hidden="true"><i/><i/><i/><b>X</b><b>Y</b><b>Z</b></div><div className="swatches">{["chrome","iridescent"].map(m=><button key={m} aria-label={`${m} material`} aria-pressed={finish===m} className={`${m} ${finish===m?"selected":""}`} onClick={()=>{setFinish(m);motionState.material=m;}}/>)}</div></div>
 </main>
 {/* Mounted outside .experience so its fixed corner placement ignores the 3D perspective container. */}
 <SoundBridge ducked={menu}/>
 <Dialog open={menu} onOpenChange={setMenu}><DialogContent className="nav-dialog"><DialogTitle className="sr-only">Explore Allu Arjun</DialogTitle><DialogDescription className="sr-only">Jump to a scene</DialogDescription><Signature/>{nav.map((n,i)=><button onClick={()=>go(n.s)} key={n.label}><span>0{i+1}</span>{n.label}<ArrowUpRight/></button>)}</DialogContent></Dialog>
 </>;
}
